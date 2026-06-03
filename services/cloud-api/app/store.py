from __future__ import annotations

from datetime import datetime, timezone
from itertools import count

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


class InMemoryStore:
    def __init__(self) -> None:
        self._telemetry_counter = count(1)
        self._event_counter = count(1)
        self._alert_counter = count(1)
        self._sync_counter = count(1)
        self.cones: dict[str, ConeRecord] = {}
        self.telemetry: list[ConeTelemetryRecord] = []
        self.events: dict[str, RoadEventRecord] = {}
        self.alerts: dict[str, AlertRecord] = {}
        self.syncs: dict[str, ExternalSyncRecord] = {}

    def ingest_telemetry(self, cone_id: str, payload: ConeTelemetryIn) -> ConeTelemetryRecord:
        now = datetime.now(timezone.utc)
        payload_data = payload.model_dump()
        payload_data["cone_id"] = cone_id
        record = ConeTelemetryRecord(
            **payload_data,
            telemetry_id=f"tel-{next(self._telemetry_counter):06d}",
            received_at=now,
        )
        self.telemetry.append(record)
        self.cones[cone_id] = ConeRecord(
            cone_id=cone_id,
            last_seen_at=payload.reported_at,
            location=payload.location,
            current_risk_level=self._estimate_risk(payload),
        )
        return record

    def create_event(self, payload: RoadEventIn) -> RoadEventRecord:
        now = datetime.now(timezone.utc)
        event = RoadEventRecord(
            **payload.model_dump(),
            event_id=f"evt-{next(self._event_counter):06d}",
            created_at=now,
            updated_at=now,
        )
        self.events[event.event_id] = event
        return event

    def list_events(self, status: str | None = None, level: RiskLevel | None = None) -> list[RoadEventRecord]:
        events = list(self.events.values())
        if status:
            events = [event for event in events if event.status == status]
        if level:
            events = [event for event in events if event.level == level]
        return events

    def create_alert(
        self,
        alert_type: str,
        level: RiskLevel,
        message: str,
        cone_id: str | None = None,
        event_id: str | None = None,
    ) -> AlertRecord:
        alert = AlertRecord(
            alert_id=f"alt-{next(self._alert_counter):06d}",
            cone_id=cone_id,
            event_id=event_id,
            alert_type=alert_type,
            level=level,
            message=message,
            created_at=datetime.now(timezone.utc),
        )
        self.alerts[alert.alert_id] = alert
        return alert

    def handle_alert(self, alert_id: str, payload: AlertHandleIn) -> AlertRecord | None:
        alert = self.alerts.get(alert_id)
        if not alert:
            return None
        alert.status = payload.action
        alert.handler = payload.handler
        alert.handled_at = datetime.now(timezone.utc)
        return alert

    def sync_event(self, event_id: str, target_platform: str = "vehicle-warning") -> ExternalSyncRecord | None:
        event = self.events.get(event_id)
        if not event:
            return None
        record = ExternalSyncRecord(
            sync_id=f"sync-{next(self._sync_counter):06d}",
            event_id=event_id,
            target_platform=target_platform,
            status="queued",
            payload={
                "event_type": event.event_type,
                "road_name": event.road_name,
                "level": event.level,
                "boundary": [point.model_dump() for point in event.boundary],
                "suggested_action": "slow_down_and_prepare_to_merge",
            },
            synced_at=datetime.now(timezone.utc),
        )
        self.syncs[record.sync_id] = record
        return record

    def _estimate_risk(self, payload: ConeTelemetryIn) -> RiskLevel:
        distances = [
            item.distance_m
            for item in payload.ultrasonic
            if item.distance_m is not None and not item.timed_out
        ]
        if distances and min(distances) < 10:
            return RiskLevel.critical
        if distances and min(distances) < 20:
            return RiskLevel.high
        if distances and min(distances) < 35:
            return RiskLevel.medium
        return RiskLevel.low


store = InMemoryStore()
