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

import java.util.List;

import org.hawkular.bus.common.AbstractMessage;
import org.hawkular.metrics.client.common.SingleMetric;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * @author Lucas Ponce
 */
public class MetricDataMessage extends AbstractMessage {

    @JsonInclude
    private MetricData metricData;

    protected MetricDataMessage() {
    }

    public MetricDataMessage(MetricData metricData) {
        this.metricData = metricData;
    }

    public MetricData getMetricData() {
        return metricData;
    }

    public void setMetricData(MetricData metricData) {
        this.metricData = metricData;
    }

    public static class MetricData {
        @JsonInclude
        String tenantId;
        @JsonInclude
        List<SingleMetric> data;

        public MetricData() {
        }

        public String getTenantId() {
            return tenantId;
        }

        public void setTenantId(String tenantId) {
            this.tenantId = tenantId;
        }

        public List<SingleMetric> getData() {
            return data;
        }

        public void setData(List<SingleMetric> data) {
            this.data = data;
        }

        @Override
        public String toString() {
            return "MetricData [tenantId=" + tenantId + ", data=" + data + "]";
        }
    }
}
