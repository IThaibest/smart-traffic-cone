# MQTT Topics

HTTP is the first runnable path. MQTT topics are reserved for later firmware
upload and cloud fan-out.

| Topic | Direction | Payload |
| --- | --- | --- |
| `cones/{cone_id}/telemetry` | ESP32 to cloud | `telemetry.schema.json` |
| `cones/{cone_id}/health` | ESP32 to cloud | device health summary |
| `cones/{cone_id}/commands` | cloud to ESP32 | remote config or diagnostics command |
| `events/{event_id}/vehicle-warning` | cloud to vehicle gateway | vehicle warning contract |
| `events/{event_id}/revocation` | cloud to vehicle gateway | warning revocation |

Retain QoS and offline buffering policy in the firmware/cloud implementation
docs before MQTT is enabled in production.
