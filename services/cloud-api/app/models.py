from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ConeStatus(str, Enum):
    inventory = "inventory"
    deployed = "deployed"
    abnormal = "abnormal"
    offline = "offline"


class LocationPayload(BaseModel):
    longitude: float | None = None
    latitude: float | None = None
    accuracy_m: float | None = None
    has_fix: bool = False


class UltrasonicChannelPayload(BaseModel):
    channel: int = Field(ge=0, le=3)
    distance_m: float | None = Field(default=None, ge=0)
    timed_out: bool = False
    sample_age_ms: int | None = Field(default=None, ge=0)


class CameraPayload(BaseModel):
    enabled: bool = False
    initialized: bool = False
    frame_available: bool = False
    last_frame_age_ms: int | None = Field(default=None, ge=0)
    frame_count: int = Field(default=0, ge=0)
    image_url: str | None = None


class DeviceHealthPayload(BaseModel):
    gps_status: str = "unknown"
    ultrasonic_status: str = "unknown"
    camera_status: str = "unknown"
    network_status: str = "unknown"
    battery_percent: float | None = Field(default=None, ge=0, le=100)


class ConeTelemetryIn(BaseModel):
    cone_id: str
    reported_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    location: LocationPayload = Field(default_factory=LocationPayload)
    ultrasonic: list[UltrasonicChannelPayload] = Field(default_factory=list)
    camera: CameraPayload = Field(default_factory=CameraPayload)
    device: DeviceHealthPayload = Field(default_factory=DeviceHealthPayload)
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class ConeTelemetryRecord(ConeTelemetryIn):
    telemetry_id: str
    received_at: datetime


class ConeRecord(BaseModel):
    cone_id: str
    status: ConeStatus = ConeStatus.deployed
    last_seen_at: datetime | None = None
    location: LocationPayload = Field(default_factory=LocationPayload)
    current_risk_level: RiskLevel = RiskLevel.low


class RoadEventIn(BaseModel):
    event_type: str
    road_name: str
    level: RiskLevel = RiskLevel.medium
    boundary: list[LocationPayload] = Field(default_factory=list)
    related_cone_ids: list[str] = Field(default_factory=list)
    description: str = ""


class RoadEventRecord(RoadEventIn):
    event_id: str
    status: str = "pending_confirmation"
    created_at: datetime
    updated_at: datetime


class AlertRecord(BaseModel):
    alert_id: str
    cone_id: str | None = None
    event_id: str | None = None
    alert_type: str
    level: RiskLevel
    message: str
    status: str = "pending"
    created_at: datetime
    handled_at: datetime | None = None
    handler: str | None = None


class AlertHandleIn(BaseModel):
    handler: str
    action: str = "confirm"
    note: str = ""


class ExternalSyncRecord(BaseModel):
    sync_id: str
    event_id: str
    target_platform: str
    status: str = "queued"
    payload: dict[str, Any] = Field(default_factory=dict)
    synced_at: datetime
