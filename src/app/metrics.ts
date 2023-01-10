// Copyright 2023 Jeremy Edwards
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as Prometheus from "prom-client";

const collectDefaultMetrics = Prometheus.collectDefaultMetrics;

class Metrics {
    public readonly RenderRequestCount: Prometheus.Counter<string>;
    public readonly RenderRequestByStatusCount: Prometheus.Counter<string>;
    public readonly RenderRequestByAttemptCount: Prometheus.Counter<string>;
    public readonly RenderSuccessByAttemptCount: Prometheus.Counter<string>;
    public readonly RenderRequestStatus: Prometheus.Gauge<string>;
    public readonly RenderLatency: Prometheus.Histogram<string>;
    public readonly RenderAttemptLatency: Prometheus.Histogram<string>;
    constructor() {
        this.RenderRequestCount = new Prometheus.Counter({
            help: "Number of page render request.",
            name: "render_request_count",
        });
        this.RenderRequestByStatusCount = new Prometheus.Counter({
            help: "Page render result by HTTP status.",
            labelNames: ["status"],
            name: "render_request_by_status_count",
        });
        this.RenderRequestByAttemptCount = new Prometheus.Counter({
            help: "Number of page render request attempts.",
            labelNames: ["attempt"],
            name: "render_request_attempt_count",
        });
        this.RenderSuccessByAttemptCount = new Prometheus.Counter({
            help: "Count of successes by attempt count.",
            labelNames: ["attempt"],
            name: "render_success_by_attempt_count",
        });
        this.RenderRequestStatus = new Prometheus.Gauge({
            help: "HTTP status code by URL from last attempt.",
            labelNames: ["url"],
            name: "render_request_status",
        });
        this.RenderLatency = new Prometheus.Histogram({
            buckets: [.1, .25, .5, 1, 2.5, 5, 10, 30, 60, 90, 120],
            help: "Latency of page render requests",
            labelNames: ["format", "success"],
            name: "render_request_latency",
        });
        this.RenderAttemptLatency = new Prometheus.Histogram({
            buckets: [.1, .25, .5, 1, 2.5, 5, 10, 30, 60, 90, 120],
            help: "Latency of render page render attempts.",
            labelNames: ["status"],
            name: "render_attempt_request_latency",
        });
    }
}

collectDefaultMetrics({ eventLoopMonitoringPrecision: 5000 });

const metrics = new Metrics();
export default metrics;
