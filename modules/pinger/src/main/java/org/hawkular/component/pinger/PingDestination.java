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

import java.util.Map;

import org.hawkular.inventory.api.model.Resource;

/**
 * A destination for pinging.
 *
 * @author Heiko W. Rupp
 * @author <a href="https://github.com/ppalaga">Peter Palaga</a>
 */
public class PingDestination {
    public static final String URL_TYPE = "URL";

    public enum ResourceField {
        url, method
    };

    public static boolean isUrl(Resource r) {
        return URL_TYPE.equals(r.getType().getId());
    }

    public static PingDestination from(Resource r) {
        Map<String, Object> props = r.getProperties();
        return new PingDestination(r.getTenantId(), r.getEnvironmentId(), r.getId(),
                (String) props.get(ResourceField.url.name()), (String) props.get(ResourceField.method.name()));
    }

    /** The default method {@value} */
    public static final String DEFAULT_METHOD = "GET";

    private final String tenantId;
    private final String environmentId;
    private final String resourceId;
    private final String url;
    private final String method;

    /**
     * Creates a new {@link PingDestination} using the default method {@value #DEFAULT_METHOD}.
     *
     * @param resourceId
     *            the resourceId of this destination
     * @param url
     *            the url to ping
     */
    public PingDestination(String tenantId, String environmentId, String resourceId, String url) {
        this(tenantId, environmentId, resourceId, url, DEFAULT_METHOD);
    }

    /**
     * Creates a new {@link PingDestination}
     *
     * @param url
     *            the url to ping
     * @param method
     *            the HTTP method to use in the ping request or null to use the default method {@value #DEFAULT_METHOD}
     * @param tenantId
     * @param environmentId
     */
    public PingDestination(String tenantId, String environmentId, String resourceId, String url, String method) {
        this.tenantId = tenantId;
        this.environmentId = environmentId;
        this.resourceId = resourceId;
        this.url = url;
        this.method = method == null ? DEFAULT_METHOD : method;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;

        PingDestination that = (PingDestination) o;

        return resourceId.equals(that.resourceId);

    }

    @Override
    public int hashCode() {
        return resourceId.hashCode();
    }

    @Override
    public String toString() {
        return "PingDestination{"
                + "tenantId='" + tenantId + '\''
                + "environmentId='" + environmentId + '\''
                + "resourceId='" + resourceId + '\''
                + ", url='" + url + '\'' + ", method='" + method
                + '\'' + '}';
    }

    public String name() {
        return resourceId + "." + url;
    }

    public String getTenantId() {
        return tenantId;
    }

    public String getEnvironmentId() {
        return environmentId;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getUrl() {
        return url;
    }

    public String getMethod() {
        return method;
    }
}
