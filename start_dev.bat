@echo off
echo Starting North Star Dev Environment...

echo [1/2] Starting FastAPI Backend on Port 9000...
start cmd /k "cd /d %~dp0 && venv\Scripts\activate && uvicorn backend.main:app --reload --host 127.0.0.1 --port 9000"

echo [2/2] Starting Next.js Frontend on Port 3000...
start cmd /k "cd /d %~dp0\frontend && npm run dev"

echo Done! Both servers should open in new command prompt windows.
