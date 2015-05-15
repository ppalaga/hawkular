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

import java.util.Map.Entry;

import javax.ejb.Asynchronous;
import javax.ejb.Stateless;
import javax.inject.Inject;

import org.hawkular.component.pinger.Traits.TraitHeader;
import org.hawkular.inventory.api.Inventory;
import org.hawkular.inventory.api.model.Resource;
import org.hawkular.inventory.api.model.Resource.Update.Builder;
import org.hawkular.inventory.cdi.Observable;

/**
 * @author <a href="https://github.com/ppalaga">Peter Palaga</a>
 */
@Stateless
public class TraitsPublisher {
    @Inject @Observable
    private Inventory.Mixin.Observable inventory;

    /**
     * Stores the given {@link Traits} in Hawkular Inventory under the given tenantId, environmentId and resourceId
     *
     * @param tenantId
     *            the ID of the tenant owning the resource under which {@code traits} should be stored
     * @param environmentId
     *            the ID of the environment where the {@code resource} is located
     * @param resourceId
     *            the ID of the resource under which {@code traits} should be stored
     * @param traits
     *            the {@link Traits} to store
     */
    @Asynchronous
    public void publish(String tenantId, String environmentId, String resourceId, Traits traits) {
        Builder resourceBuilder = Resource.Update.builder();
        resourceBuilder.withProperty("traits-collected-on", traits.getTimestamp());
        for (Entry<TraitHeader, String> entry : traits.getItems().entrySet()) {
            resourceBuilder.withProperty("trait-" + entry.getKey().toString(), entry.getValue());
        }

        inventory.tenants().get(tenantId).environments().get(environmentId).feedlessResources().get(resourceId)
                .entity().update().with(resourceBuilder.build());

    }

}
