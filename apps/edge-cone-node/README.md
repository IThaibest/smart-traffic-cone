# Edge Cone Node Firmware

ESP-IDF firmware for one smart traffic cone edge node. The app owns product
orchestration: initialize hardware modules, collect snapshots, encode
telemetry, and upload to the cloud.

Build from this directory:

```powershell
idf.py build
```

The repository root is a workspace, not an ESP-IDF project. Keep ESP-IDF
project files inside this app directory.
