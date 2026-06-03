from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query

from .models import (
    AlertHandleIn,
    AlertRecord,
    ConeRecord,
    ConeTelemetryIn,
    ConeTelemetryRecord,
    ExternalSyncRecord,
    RiskLevel,
    RoadEventIn,
    RoadEventRecord,
)
from .store import store

app = FastAPI(
    title="Smart Traffic Cone Cloud API",
    version="0.1.0",
    description="Cloud API skeleton for smart traffic cone telemetry and dispatch workflows.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/cones/{cone_id}/telemetry", response_model=ConeTelemetryRecord)
def ingest_telemetry(cone_id: str, payload: ConeTelemetryIn) -> ConeTelemetryRecord:
    record = store.ingest_telemetry(cone_id, payload)
    if record.location.has_fix is False:
        store.create_alert(
            alert_type="gps_no_fix",
            level=RiskLevel.medium,
            message="Telemetry arrived without a valid GPS fix.",
            cone_id=cone_id,
        )
    return record


@app.get("/api/cones", response_model=list[ConeRecord])
def list_cones() -> list[ConeRecord]:
    return list(store.cones.values())


@app.get("/api/cones/{cone_id}", response_model=ConeRecord)
def get_cone(cone_id: str) -> ConeRecord:
    cone = store.cones.get(cone_id)
    if not cone:
        raise HTTPException(status_code=404, detail="cone_not_found")
    return cone


@app.get("/api/events", response_model=list[RoadEventRecord])
def list_events(
    status: str | None = None,
    level: RiskLevel | None = None,
) -> list[RoadEventRecord]:
    return store.list_events(status=status, level=level)


@app.post("/api/events", response_model=RoadEventRecord)
def create_event(payload: RoadEventIn) -> RoadEventRecord:
    return store.create_event(payload)


@app.get("/api/alerts", response_model=list[AlertRecord])
def list_alerts(status: str | None = Query(default=None)) -> list[AlertRecord]:
    alerts = list(store.alerts.values())
    if status:
        alerts = [alert for alert in alerts if alert.status == status]
    return alerts


@app.post("/api/alerts/{alert_id}/handle", response_model=AlertRecord)
def handle_alert(alert_id: str, payload: AlertHandleIn) -> AlertRecord:
    alert = store.handle_alert(alert_id, payload)
    if not alert:
        raise HTTPException(status_code=404, detail="alert_not_found")
    return alert


@app.post("/api/events/{event_id}/sync", response_model=ExternalSyncRecord)
def sync_event(event_id: str, target_platform: str = "vehicle-warning") -> ExternalSyncRecord:
    record = store.sync_event(event_id, target_platform=target_platform)
    if not record:
        raise HTTPException(status_code=404, detail="event_not_found")
    return record
