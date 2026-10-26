import subprocess
import sys
import time
import webbrowser


# Project paths
ROOT = r"C:\Users\manis\OneDrive\Documents\spendlog-ai"

PYTHON = sys.executable

BACKEND = ROOT + r"\backend"
FRONTEND = ROOT + r"\frontend"


# Start FastAPI
backend_process = subprocess.Popen(
    [
        PYTHON,
        "-m",
        "uvicorn",
        "main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000"
    ],
    cwd=BACKEND
)


# Start Frontend
frontend_process = subprocess.Popen(
    [
        PYTHON,
        "-m",
        "http.server",
        "8080",
        "--bind",
        "127.0.0.1"
    ],
    cwd=FRONTEND
)


print("======================================")
print("       SpendLog AI Started")
print("======================================")
print("FastAPI  : http://127.0.0.1:8000")
print("Frontend : http://127.0.0.1:8080")
print("Dashboard: http://127.0.0.1:8080/index.html")
print("======================================")


# Give servers a moment to start
time.sleep(2)


# Open dashboard automatically
webbrowser.open(
    "http://127.0.0.1:8080/index.html"
)


try:
    # Keep both servers running
    while True:

        if backend_process.poll() is not None:
            print("FastAPI server stopped.")
            break

        if frontend_process.poll() is not None:
            print("Frontend server stopped.")
            break

        time.sleep(1)


except KeyboardInterrupt:
    pass


finally:

    print("Stopping SpendLog AI...")

    backend_process.terminate()
    frontend_process.terminate()

    backend_process.wait()
    frontend_process.wait()

    print("SpendLog AI stopped.")