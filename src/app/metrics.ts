import * as Prometheus from "prom-client";

const collectDefaultMetrics = Prometheus.collectDefaultMetrics;

class Metrics {
    public readonly RenderRequestCount: Prometheus.Counter;
    public readonly RenderRequestByStatusCount: Prometheus.Counter;
    public readonly RenderRequestByAttemptCount: Prometheus.Counter;
    public readonly RenderSuccessByAttemptCount: Prometheus.Counter;
    public readonly RenderRequestStatus: Prometheus.Gauge;
    public readonly RenderLatency: Prometheus.Histogram;
    public readonly RenderAttemptLatency: Prometheus.Histogram;
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

collectDefaultMetrics({ timeout: 5000 });

const metrics = new Metrics();
export default metrics;
