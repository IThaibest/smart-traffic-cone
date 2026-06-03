# Cloud Development Guide

## Structure

```text
services/cloud-api/
  app/main.py      FastAPI routes.
  app/models.py    Pydantic request and response models.
  app/store.py     In-memory first-version persistence.
```

The skeleton is intentionally simple so interface work can begin before the
database is selected.

## Local Run

```powershell
cd services/cloud-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` to inspect OpenAPI.

## API Rules

- Pydantic models define the public interface.
- Route handlers should stay thin.
- Risk rules can start in `store.py`, but move to a dedicated risk module when
  rules become more complex.
- Keep vehicle warning output aligned with `contracts/vehicle-warning.md`.
