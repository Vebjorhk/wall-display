import platform
import time

import psutil
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcstatus import JavaServer


def _get_os_name() -> str:
    try:
        with open('/etc/os-release') as f:
            for line in f:
                if line.startswith('PRETTY_NAME='):
                    return line.split('=', 1)[1].strip().strip('"')
    except OSError:
        pass
    return f"{platform.system()} {platform.release()}"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/system")
def get_system():
    cpu_percent = psutil.cpu_percent(interval=None)

    try:
        with open("/sys/class/thermal/thermal_zone0/temp") as f:
            cpu_temp = int(f.read().strip()) / 1000
    except (FileNotFoundError, ValueError, OSError):
        cpu_temp = None

    cpu_freq = psutil.cpu_freq()

    ram = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    # Sample network I/O over 1 second
    net_before = psutil.net_io_counters()
    time.sleep(1)
    net_after = psutil.net_io_counters()
    upload_mbs = (net_after.bytes_sent - net_before.bytes_sent) / (1024**2)
    download_mbs = (net_after.bytes_recv - net_before.bytes_recv) / (1024**2)

    uptime_seconds = int(time.time() - psutil.boot_time())

    return {
        "cpu": {
            "percent": cpu_percent,
            "temp_celsius": cpu_temp,
            "freq_mhz": cpu_freq.current if cpu_freq else None,
        },
        "ram": {
            "percent": ram.percent,
            "used_gb": round(ram.used / 1024**3, 2),
            "total_gb": round(ram.total / 1024**3, 2),
        },
        "disk": {
            "percent": disk.percent,
            "used_gb": round(disk.used / 1024**3, 2),
            "total_gb": round(disk.total / 1024**3, 2),
        },
        "network": {
            "upload_mbs": round(upload_mbs, 3),
            "download_mbs": round(download_mbs, 3),
        },
        "uptime_seconds": uptime_seconds,
        "os_name": _get_os_name(),
    }


@app.get("/minecraft")
def get_minecraft():
    try:
        server = JavaServer.lookup("localhost")
        status = server.status()
        players = [p.name for p in status.players.sample] if status.players.sample else []
        try:
            motd = status.motd.to_plain()
        except AttributeError:
            motd = str(getattr(status, 'description', ''))
        return {
            "online": True,
            "players_online": status.players.online,
            "players_max": status.players.max,
            "players": players,
            "latency_ms": round(status.latency, 1),
            "motd": motd,
        }
    except Exception:
        return {"online": False}


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)
