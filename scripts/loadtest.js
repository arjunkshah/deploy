const autocannon = require("autocannon");

const target = process.env.TARGET_URL || "http://localhost:3000";
const connections = Number(process.env.LOADTEST_CONNECTIONS || "50");
const duration = Number(process.env.LOADTEST_DURATION || "20");

const instance = autocannon(
  {
    url: target,
    connections,
    duration,
    pipelining: 1
  },
  (error, result) => {
    if (error) {
      console.error("Load test failed:", error.message);
      process.exit(1);
    }
    console.log(`Requests: ${result.requests.total}`);
    console.log(`Latency p99: ${result.latency.p99} ms`);
    console.log(`Throughput: ${result.throughput.total} bytes`);
  }
);

autocannon.track(instance, { renderProgressBar: true });
