/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import excMetrics from '@adobe/exc-app/metrics';

let excMetricsInstance;

const getMetrics = () => {
  if (excMetricsInstance) {
    return excMetricsInstance;
  } else {
    excMetricsInstance = excMetrics.create('com.adobe.aem.generatevariations');
    return excMetricsInstance;
  }
};

export function log(id, data = {}) {
  const metrics = getMetrics();
  metrics.log(id, data);
}

export function analytics(eventData, ...args) {
  const metrics = getMetrics();
  metrics.analytics.trackEvent({ feature: 'GenAI in Generate Variations', ...eventData }, ...args);
}

export function error(id, data = {}) {
  const metrics = getMetrics();
  metrics.error(id, data);
}
