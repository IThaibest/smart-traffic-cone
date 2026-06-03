# Communication Protocol

## First Runnable Path

The first runnable cloud path is HTTP:

```http
POST /api/cones/{cone_id}/telemetry
```

Payloads follow `contracts/telemetry.schema.json`.

## Retry and Offline Policy

Firmware should treat upload as app-level behavior:

- keep the latest telemetry snapshot in memory;
- retry failed uploads with bounded backoff;
- count consecutive upload failures in Device Health;
- preserve the sensor Module interfaces regardless of transport choice.

Persistent offline buffering is planned but not implemented in the first
skeleton.

## MQTT Reserved Topics

Reserved MQTT topics are documented in `contracts/mqtt-topics.md`. Do not add
firmware MQTT behavior until cloud credentials, QoS, and offline buffering are
specified.

## Vehicle Warning Flow

Cloud publishes vehicle warnings only after a Road Event has an active boundary
and enough freshness or operator confirmation. The contract is documented in
`contracts/vehicle-warning.md`.
