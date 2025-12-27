@echo off
echo Creating backup...
robocopy "C:\Users\Carol\Desktop\cripto app v2" "C:\Users\Carol\Desktop\cripto app v2 backup" /E /XD node_modules .git dist .gemini /R:0 /W:0
if %ERRORLEVEL% LEQ 4 exit /b 0
exit /b %ERRORLEVEL%
