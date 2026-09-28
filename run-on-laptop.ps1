# TaskFlow One-Click Laptop Runner
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   TaskFlow - One-Click Laptop Startup Script       " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Environment Variables Configuration
$env:ANDROID_HOME = "C:\Users\Lokeshwar\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$($env:JAVA_HOME)\bin;$($env:ANDROID_HOME)\platform-tools;$($env:ANDROID_HOME)\emulator;$($env:PATH)"


Write-Host "`n[1/4] Checking Database and Backend..." -ForegroundColor Green
$backendTest = Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet
if ($backendTest) {
    Write-Host "   -> Backend is already running on http://localhost:5000" -ForegroundColor Yellow
} else {
    Write-Host "   -> Starting Backend API server on http://localhost:5000..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/backend'; npm run dev"
    Start-Sleep -Seconds 3
}

# 2. Check Metro Bundler
Write-Host "`n[2/4] Checking Metro Bundler..." -ForegroundColor Green
$metroTest = Test-NetConnection -ComputerName localhost -Port 8081 -InformationLevel Quiet
if ($metroTest) {
    Write-Host "   -> Metro Bundler is already running on http://localhost:8081" -ForegroundColor Yellow
} else {
    Write-Host "   -> Starting Metro Bundler..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/mobile'; npx metro start --host 0.0.0.0 --port 8081"
    Start-Sleep -Seconds 3
}

# 3. Check Android Emulator / Connected Device
Write-Host "`n[3/4] Checking Android Devices..." -ForegroundColor Green
$devices = & "$env:ANDROID_HOME\platform-tools\adb.exe" devices
Write-Host $devices

if ($devices -notmatch "device\b") {
    Write-Host "   -> No running emulator detected. Launching Medium_Phone_API_35..." -ForegroundColor Cyan
    Start-Process "$env:ANDROID_HOME\emulator\emulator.exe" -ArgumentList "-avd", "Medium_Phone_API_35"
    Write-Host "   -> Waiting for emulator device..."
    & "$env:ANDROID_HOME\platform-tools\adb.exe" wait-for-device
    Write-Host "   -> Waiting for Android OS to finish booting..." -ForegroundColor Cyan
    $bootCompleted = ""
    while ($bootCompleted -ne "1") {
        Start-Sleep -Seconds 2
        $bootCompleted = (& "$env:ANDROID_HOME\platform-tools\adb.exe" shell getprop sys.boot_completed 2>$null).Trim()
    }
    Write-Host "   -> Emulator boot completed!" -ForegroundColor Green
}

# Setup Port Forwarding
Write-Host "`n[4/4] Setting up ADB Port Reverse..." -ForegroundColor Green
& "$env:ANDROID_HOME\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
& "$env:ANDROID_HOME\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
Write-Host "   -> Forwarded ports 5000 and 8081 to Android device." -ForegroundColor Yellow

# Launch Mobile App
Write-Host "`n[TaskFlow] Building and launching TaskFlow on Android..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot/mobile"
npx react-native run-android
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nTaskFlow Android build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`nTaskFlow launched successfully!" -ForegroundColor Green
