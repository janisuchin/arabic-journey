<#
  Build installable Android APKs locally (no EAS quota needed).

    powershell -File tools\build-android.ps1 -Variant normal
    powershell -File tools\build-android.ps1 -Variant unlocked

  Needs the portable toolchain in C:\Users\DELL\android-build (JDK 21 + Android SDK/NDK), shared with the
  other Journey apps. React Native's native build breaks on paths with spaces and on very long paths, so the
  project is copied to C:\m\ar (normal) or C:\m\aru (unlocked) and built there (the other Journey apps use
  C:\m\a, f, g, n, r, u and their *u folders, so no app overwrites another's build folder). The APK is copied
  into "all release journey and links and architecture\releases\<version folder>\android(-unlocked)\".
  It is signed with the React Native debug key: fine for installing directly on a phone, not for the
  Play Store (use EAS production builds for that).
#>
param([Parameter(Mandatory)][ValidateSet('normal', 'unlocked')][string]$Variant, [string]$ReleaseFolder)
$ErrorActionPreference = 'Continue'
$root = Split-Path $PSScriptRoot -Parent
$work = if ($Variant -eq 'unlocked') { 'C:\m\aru' } else { 'C:\m\ar' }
$env:JAVA_HOME = 'C:\Users\DELL\android-build\jdk'
$env:ANDROID_HOME = 'C:\Users\DELL\android-build\sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:NODE_ENV = 'production'
if ($Variant -eq 'unlocked') { $env:EXPO_PUBLIC_UNLOCK_ALL = '1'; $env:APP_VARIANT = 'unlocked' } else { Remove-Item Env:EXPO_PUBLIC_UNLOCK_ALL, Env:APP_VARIANT -ErrorAction SilentlyContinue }

Write-Output "Copying the project to $work ..."
robocopy $root $work /MIR /XD node_modules android ios dist dist-unlocked .expo test-results playwright-report releases .cache .git 'all release journey and links and architecture' /NFL /NDL /NJH /NJS /NP | Out-Null
Set-Location $work
Write-Output 'Installing dependencies ...'
npm ci --no-audit --no-fund 2>&1 | Select-Object -Last 2
Write-Output 'Generating the native Android project ...'
npx expo prebuild -p android --clean --no-install 2>&1 | Select-Object -Last 3
Set-Content -Path "$work\android\local.properties" -Value 'sdk.dir=C:/Users/DELL/android-build/sdk' -Encoding ascii
Set-Location "$work\android"
Write-Output 'Building the release APK (this takes a while) ...'
.\gradlew.bat assembleRelease --no-daemon -q '-PreactNativeArchitectures=arm64-v8a,armeabi-v7a' 2>&1 | Where-Object { $_ -notmatch '^w: |warning:' } | Select-Object -Last 25
$apk = "$work\android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apk)) { Write-Output 'BUILD FAILED: no APK produced'; exit 1 }

$appVersion = (Get-Content "$root\app.json" -Raw | ConvertFrom-Json).expo.version
$name = if ($Variant -eq 'unlocked') { "Arabic-Journey-v$appVersion-UNLOCKED.apk" } else { "Arabic-Journey-v$appVersion.apk" }
$base = Join-Path $root 'all release journey and links and architecture\releases'
if (-not $ReleaseFolder) { $ReleaseFolder = (Get-ChildItem $base -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "v$appVersion *" } | Select-Object -First 1).Name }
if (-not $ReleaseFolder) { $ReleaseFolder = "v$appVersion" }
$dest = Join-Path (Join-Path $base $ReleaseFolder) $(if ($Variant -eq 'unlocked') { 'android-unlocked' } else { 'android' })
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item $apk (Join-Path $dest $name) -Force
Write-Output "APK READY: $(Join-Path $dest $name) ($([math]::Round((Get-Item $apk).Length / 1MB, 1)) MB)"
