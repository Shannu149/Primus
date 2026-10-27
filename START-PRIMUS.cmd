@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Primus.ps1"
if errorlevel 1 pause
endlocal
