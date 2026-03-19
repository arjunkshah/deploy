# Testing

## Unit tests
Run unit tests with Vitest:
```
npm run test
```

## Health check
Basic endpoint checks:
```
npm run healthcheck
```

Set `TARGET_URL` to test a deployed environment:
```
TARGET_URL=https://deploydotcom.vercel.app npm run healthcheck
```

## Load testing
Use Autocannon to run a basic stress test against the root page:
```
npm run loadtest
```

Configure the target and load profile:
```
TARGET_URL=http://localhost:3000 LOADTEST_CONNECTIONS=100 LOADTEST_DURATION=30 npm run loadtest
```
