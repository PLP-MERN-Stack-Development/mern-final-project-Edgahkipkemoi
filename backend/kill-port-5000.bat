@echo off
echo Killing process on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    taskkill /F /PID %%a 2>nul
)
echo Port 5000 is now free!
pause
