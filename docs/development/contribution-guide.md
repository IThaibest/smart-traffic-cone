# Contribution Guide

## Branches

Create a branch per coherent change:

```text
feature/gps-module
feature/cloud-telemetry-api
docs/hardware-wiring
```

## Pull Requests

Every PR should explain:

- affected subsystem;
- interface changes;
- validation performed;
- hardware wiring assumptions, when relevant.

## Ownership

- Hardware contributors work in `components/cone_device` and
  `apps/edge-cone-node`.
- Cloud contributors work in `services/cloud-api` and `contracts`.
- Dispatch UI contributors work in `apps/dispatch-web`.
- Interface changes start in `contracts` before implementation changes.

## Interface Change Flow

1. Update schema or contract docs.
2. Update firmware encoder or cloud models.
3. Update examples.
4. Run validation checks.
5. Mention migration impact in the PR.
