const target = process.env.TARGET_URL || "http://localhost:3000";

async function check(path, expectedStatus) {
  const res = await fetch(`${target}${path}`);
  if (res.status !== expectedStatus) {
    throw new Error(`${path} returned ${res.status}, expected ${expectedStatus}`);
  }
}

async function main() {
  await check("/", 200);
  await check("/docs", 200);
  await check("/api/status/invalid", 404);
  console.log("Healthcheck passed");
}

main().catch((error) => {
  console.error("Healthcheck failed:", error.message);
  process.exit(1);
});
