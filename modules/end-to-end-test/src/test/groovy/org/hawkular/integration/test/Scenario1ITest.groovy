/**
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

package org.hawkular.integration.test

import java.util.Map;

import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.LaxRedirectStrategy;
import org.hawkular.inventory.api.model.Environment
import org.hawkular.inventory.api.model.Metric
import org.hawkular.inventory.api.model.MetricType
import org.hawkular.inventory.api.model.MetricUnit;
import org.hawkular.inventory.api.model.Resource
import org.hawkular.inventory.api.model.ResourceType
import org.hawkular.inventory.api.model.Tenant

import static org.junit.Assert.assertTrue;

import org.junit.Assert;
import org.junit.Test


class Scenario1ITest extends AbstractTestBase {

    static final String urlTypeId = "URL"
    static final String environmentId = "test"

    @Test
    public void testScenario() throws Exception {
        //def response = client.get(path: "/hawkular-accounts/organizations")
        def response = client.get(path: "/hawkular-accounts/personas/current")
        assertResponseOk(response.status)
        String tenantId = response.data.id
        println "tenantId = $tenantId"

        /* assert the test environment exists */
        response = client.get(path: "/hawkular/inventory/$tenantId/environments/$environmentId")
        assertResponseOk(response.status)
        org.junit.Assert.assertEquals(environmentId, response.data.id)

        /* assert the URL resource type exists */
        response = client.get(path: "/hawkular/inventory/$tenantId/resourceTypes/$urlTypeId")
        assertResponseOk(response.status)
        org.junit.Assert.assertEquals(urlTypeId, response.data.id)

        /* assert the metric types exist */
        response = client.get(path: "/hawkular/inventory/$tenantId/metricTypes/status.code.type")
        assertResponseOk(response.status)
        response = client.get(path: "/hawkular/inventory/$tenantId/metricTypes/status.duration.type")
        assertResponseOk(response.status)

        /* create a URL */
        String resourceId = UUID.randomUUID().toString();
        def newResource = Resource.Blueprint.builder().withId(resourceId)
                .withResourceType(urlTypeId).withProperty("url", "http://hawkular.org").build()
        response = client.post(path: "/hawkular/inventory/$tenantId/$environmentId/resources", body : newResource)
        assertResponseOk(response.status)

        // 6) create metrics
        def status_code = new Metric(tenantId, environmentId, "status.code", status_code_type)
        def status_time = new Metric(tenantId, environmentId, "status.time", status_time_type)
        response = client.post(path: "/inventory/$tenantId/$environmentId/metrics", body: status_code)
        assertResponseOk(response.status)
        response = client.post(path: "/inventory/$tenantId/$environmentId/metrics", body: status_time)
        assertResponseOk(response.status)

        // 7) assign metrics to the resource
        response = client.post(path: "/inventory/$tenantId/$environmentId/resources/$hawk_id/metrics",
        body: [
            "status.code",
            "status.time"]
        )
        assertResponseOk(response.status)

        // 8 informing pinger is internal (bus msg)

        // 9 simulate ping + response - metrics for ~ the last 30 minutes
        for (int i = -30 ; i <-3 ; i++ ) {
            postMetricValue(hawk_id, status_time.id, 100 + i, i)
            postMetricValue(hawk_id, status_code.id, 200, i)
        }

        postMetricValue(hawk_id, status_code.id, 500, -2)
        postMetricValue(hawk_id, status_code.id, 404, -1)
        postMetricValue(hawk_id, status_code.id, 200, 0)
        postMetricValue(hawk_id, status_time.id, 42, 0)

        // 10 Get values for a chart - last 4h data

        def end = System.currentTimeMillis()
        def start = end - 4 *3600 * 1000 // 4h earlier
        response = client.get(path: "/hawkular-metrics/$tenantId/metrics/numeric/${hawk_id}.status.time/data", query:
        [start: start, end: end])

        println(response.data)

        // 11 define an alert

        //        response = client.post(path: "alerts/triggers/")

    }

    private void assertResponseOk(int responseCode) {
        assertTrue("Response code should be 2xx or 304 but was "+ responseCode,
                (responseCode >= 200 && responseCode < 300) || responseCode == 304)
    }

    private void postMetricValue(String resourceId, String metricName, int value, int timeSkewMinutes = 0) {
        def response
        def now = System.currentTimeMillis()
        def tmp = "$resourceId.$metricName"

        long time = now + (timeSkewMinutes * 60 * 1000)

        response = client.post(path: "/hawkular-metrics/$tenantId/metrics/numeric/$tmp/data",
        body: [
            [timestamp: time, value: value]
        ])
        assertResponseOk(response.status)
    }
}