# Hardware Development Guide

## Goals

- Keep product orchestration in `apps/edge-cone-node`.
- Keep reusable sensor and actuator behavior in `components/cone_device`.
- Keep concrete pins, UART ports, shared buses, and board variants in BSP
  configuration when those facts are known.
- Keep hardware interfaces generic until module models are confirmed.

## Module Shape

Each Hardware Module should expose:

- `setup_<module>(config)`: initialize driver resources.
- `tick_<module>()`: advance non-blocking work.
- `<module>_status()`: return a snapshot value, not mutable internal state.
- `deinit_<module>()`: release driver and board resources.

The first modules are:

- `gps_module`: location and freshness.
- `ultrasonic_array`: four distance channels.
- `camera_module`: camera availability and frame status.
- `telemetry_encoder`: structured cloud upload payload.

## Kconfig

Each optional module owns an enable flag:

```text
CONFIG_CONE_DEVICE_ENABLE_GPS
CONFIG_CONE_DEVICE_ENABLE_ULTRASONIC_ARRAY
CONFIG_CONE_DEVICE_ENABLE_CAMERA
```

Disabled modules must still link and return a status with `last_error` set to
`disabled`.

## BSP and Wiring

Do not hardcode confirmed pins in app logic. Record wiring in a BSP layer or
app-level config when hardware is finalized:

| Hardware | Current status | Notes |
| --- | --- | --- |
| ESP32 controller | planned | exact board variant pending |
| Positioning module | generic GPS interface | model pending |
| Ultrasonic modules | four-channel interface | model pending |
| Camera | generic camera interface | model pending |

## Test Requirements

- Build `apps/edge-cone-node` with all modules enabled.
- Build at least one app or config with modules disabled to confirm stubs link.
- For real hardware PRs, document wiring, sample logs, and failure modes.
