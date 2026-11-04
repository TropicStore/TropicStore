# Fruit Chamber Database

AWS region: `ap-southeast-1`

## Table: `FruitChamberTelemetry`

| | |
|---|---|
| Partition key | `deviceId` (String) — current value `chamber01` |
| Sort key | `timestamp` (Number) — epoch milliseconds |
| Billing | PAY_PER_REQUEST |
| TTL | optional `ttl` attribute (epoch seconds) if retention is needed |

### `id`
```
deviceId (S)  timestamp (N)
```

### `Q`
- (none — the table is read with `deviceId = :deviceId` + `ScanIndexForward(false)` to get "latest first")

### Write path
ESP32 → AWS IoT Core (`tropicstore/chamber01/telemetry`) → IoT Rule → `PutItem`

### Read path
React app → API Gateway → Lambda → `Query` on `deviceId`, sorted by `timestamp`

### Example item
```json
{
  "deviceId": "chamber01",
  "timestamp": 1788500000000,
  "temperature": 28.4,
  "humidity": 82.1,
  "dht_valid": true,
  "mq3_raw": 1234,
  "mq3_filtered": 1200,
  "mq3_ppm": 0,
  "mq3_voltage": 1.8,
  "mq3_rs": 15.2,
  "mq3_ro": 0,
  "mq3_calibrated": false,
  "mq3_warmed_up": true
}
```

> The React frontend does **not** access this table directly. All reads/writes go through the `FruitChamberAPI` Lambda via API Gateway.