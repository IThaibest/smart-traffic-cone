# Cloud API

FastAPI skeleton for receiving smart cone telemetry, maintaining device state,
creating road events, handling alerts, and publishing road warnings to external
systems.

Run locally:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

OpenAPI docs are available at `http://127.0.0.1:8000/docs`.
