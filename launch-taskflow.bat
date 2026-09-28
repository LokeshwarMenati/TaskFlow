@echo off
title TaskFlow Launcher
echo ====================================================
echo    Launching TaskFlow Android Emulator & App
echo ====================================================

echo Starting Android Emulator window...
start "" "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_35

echo Waiting for Android device to boot...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" wait-for-device

echo Forwarding network ports...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081

echo Starting TaskFlow App...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" shell am start -n com.taskflow/.MainActivity

echo ====================================================
echo TaskFlow is now running on your phone emulator!
echo ====================================================
