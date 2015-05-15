/*
 * Copyright 2015 Red Hat, Inc. and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.hawkular.component.pinger;

import static org.hawkular.component.pinger.PingDestination.URL_TYPE;
import static org.hawkular.inventory.api.Action.created;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;

import org.hawkular.inventory.api.Interest;
import org.hawkular.inventory.api.Inventory;
import org.hawkular.inventory.api.filters.With;
import org.hawkular.inventory.api.model.Resource;
import org.hawkular.inventory.cdi.Observable;
import org.hawkular.metrics.client.common.SingleMetric;

import rx.functions.Action1;

/**
 * A SLSB that coordinates the pinging of resources
 *
 * @author Heiko W. Rupp
 */
@Startup
@Singleton
public class PingManager {

    /**
     * Collects new URLs reported by {@link PingManager#inventory} and synchronizes the various threads reporting the
     * new URLs and those ones consuming them.
     *
     * @author <a href="https://github.com/ppalaga">Peter Palaga</a>
     */
    private static class NewUrlsCollector implements Action1<Resource> {
        private List<PingDestination> newUrls = new ArrayList<>();

        @Override
        public void call(Resource r) {
            if (PingDestination.isUrl(r)) {
                synchronized (this) {
                    newUrls.add(PingDestination.from(r));
                }
            }
        }

        public List<PingDestination> getNewUrls() {
            synchronized (this) {
                if (this.newUrls.isEmpty()) {
                    return Collections.emptyList();
                } else {
                    List<PingDestination> result = this.newUrls;
                    this.newUrls = new ArrayList<>();
                    return result;
                }
            }
        }
    }

    /** How many rounds a WAIT_MILLIS do we wait for results to come in? */
    private static final int ROUNDS = 15;
    /** How long do we wait between each round in milliseconds */
    private static final int WAIT_MILLIS = 500;
    /**
     * Rough timeout in milliseconds for the pings after which the pings are cancelled and reported as timeouted. Note
     * that in practice, the real time given to pings can be longer.
     */
    private static final int TIMEOUT_MILLIS = ROUNDS * WAIT_MILLIS;

    @EJB
    public Pinger pinger;

    private final Set<PingDestination> destinations = new HashSet<>();

    @EJB
    public MetricPublisher metricPublisher;

    @EJB
    public TraitsPublisher traitsPublisher;

    @Inject
    @Observable
    private Inventory.Mixin.Observable inventory;

    private final NewUrlsCollector newUrlsCollector = new NewUrlsCollector();

    @PostConstruct
    public void startUp() {

        /*
         * Add the observer before reading the existing URLs from the inventory so that we do not loose the URLs that
         * could have been added between those two calls.
         */
        inventory.observable(Interest.in(Resource.class).being(created())).subscribe(newUrlsCollector);

        Set<Resource> urls = inventory.tenants().getAll().resourceTypes().getAll(With.id(URL_TYPE)).resources()
                .getAll().entities();
        Log.LOG.debugf("About to initialize Hawkular Pinger with %d URLs", urls.size());

        for (Resource r : urls) {
            destinations.add(PingDestination.from(r));
        }

        Log.LOG.debugf("Initialized Hawkular Pinger with %d URLs", urls.size());

    }

    /**
     * This method triggers the actual work by starting pingers, collecting their return values and then publishing
     * them.
     */
    @Schedule(minute = "*", hour = "*", second = "0,20,40", persistent = false)
    public void scheduleWork() {

        List<PingDestination> newUrls = newUrlsCollector.getNewUrls();
        destinations.addAll(newUrls);

        if (destinations.size() == 0) {
            return;
        }

        doThePing(destinations);
    }

    /**
     * Runs the pinging work on the provided list of destinations. The actual pings are scheduled to run in parallel in
     * a thread pool. After ROUNDS*WAIT_MILLIS, remaining pings are cancelled and an error
     *
     * @param destinations
     *            Set of destinations to ping
     */
    private void doThePing(Set<PingDestination> destinations) {
        List<PingStatus> results = new ArrayList<>(destinations.size());
        // In case of timeouts we will not be able to get the PingStatus from the Future, so use a Map
        // to keep track of what destination's ping actually hung.
        Map<Future<PingStatus>, PingDestination> futures = new HashMap<>(destinations.size());

        for (PingDestination destination : destinations) {
            Future<PingStatus> result = pinger.ping(destination);
            futures.put(result, destination);
        }

        int round = 1;
        while (!futures.isEmpty() && round < ROUNDS) {
            Iterator<Future<PingStatus>> iterator = futures.keySet().iterator();
            while (iterator.hasNext()) {
                Future<PingStatus> f = iterator.next();
                if (f.isDone()) {
                    try {
                        results.add(f.get());
                    } catch (InterruptedException | ExecutionException e) {
                        e.printStackTrace(); // TODO: Customise this generated block
                    }
                    iterator.remove();
                }
            }
            try {
                Thread.sleep(WAIT_MILLIS); // wait until the next iteration
            } catch (InterruptedException e) {
                // We don't care
            }
            round++;
        }

        // Cancel hanging pings and report them as timeouts
        for (Map.Entry<Future<PingStatus>, PingDestination> entry : futures.entrySet()) {
            entry.getKey().cancel(true);
            PingDestination destination = entry.getValue();
            final long now = System.currentTimeMillis();
            PingStatus ps = PingStatus.timeout(destination, now, TIMEOUT_MILLIS);
            results.add(ps);
        }

        reportResults(results);
    }

    private void reportResults(List<PingStatus> results) {

        if (results.size() == 0) {
            return;
        }

        List<SingleMetric> singleMetrics = new ArrayList<>(results.size());
        List<Map<String, Object>> mMetrics = new ArrayList<>();

        for (PingStatus status : results) {

            addDataItem(mMetrics, status, status.duration, "duration");
            addDataItem(mMetrics, status, status.code, "code");

            // for the topic to alerting
            final String resourceId = status.destination.getResourceId();
            SingleMetric singleMetric = new SingleMetric(resourceId + ".status.duration", status.getTimestamp(),
                    (double) status.getDuration());
            singleMetrics.add(singleMetric);
            singleMetric = new SingleMetric(resourceId + ".status.code", status.getTimestamp(),
                    (double) status.getCode());
            singleMetrics.add(singleMetric);

        }

        // Send them away
        metricPublisher.sendToMetricsViaRest(tenantId, mMetrics);
        metricPublisher.publishToTopic(tenantId, singleMetrics);

        // Publish the traits
        for (PingStatus status : results) {
            PingDestination destination = status.destination;
            final String environmentId = "whatever";
            traitsPublisher.publish(tenantId, environmentId, destination.getResourceId(), status.traits);
        }

    }

    private void addDataItem(List<Map<String, Object>> mMetrics, PingStatus status, Number value, String name) {
        Map<String, Number> dataMap = new HashMap<>(2);
        dataMap.put("timestamp", status.getTimestamp());
        dataMap.put("value", value);
        List<Map<String, Number>> data = new ArrayList<>(1);
        data.add(dataMap);
        Map<String, Object> outer = new HashMap<>(2);
        outer.put("id", status.destination.getResourceId() + ".status." + name);
        outer.put("data", data);
        mMetrics.add(outer);
    }

    /**
     * Add a new destination into the system. This triggers an immediate ping and then adding to the list of
     * destinations.
     *
     * @param pd
     *            new Destination
     */
    public void addDestination(PingDestination pd) {
        destinations.add(pd);
    }

    public List<PingDestination> getDestinations() {
        return new ArrayList<>(destinations);
    }

    public void removeDestination(PingDestination url) {
        destinations.remove(url);
    }

}
