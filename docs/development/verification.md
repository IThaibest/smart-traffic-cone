# Verification

Run repository-level skeleton checks:

```powershell
python .\tools\check_project.py
```

Check dispatch-web JavaScript:

```powershell
node --check .\apps\dispatch-web\script.js
```

Check cloud API syntax:

```powershell
python -m py_compile .\services\cloud-api\app\main.py .\services\cloud-api\app\models.py .\services\cloud-api\app\store.py
```

Build firmware after ESP-IDF is installed and exported:

```powershell
cd apps\edge-cone-node
idf.py build
```

The current workspace root is not an ESP-IDF project; run firmware commands
from `apps/edge-cone-node`.
