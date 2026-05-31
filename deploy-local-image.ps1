param(
  [Parameter(Mandatory=$true)]
  [string]$HostName,

  [string]$User = "ec2-user",

  [Parameter(Mandatory=$true)]
  [string]$KeyPath,

  [string]$EnvFile = ".env.production",
  [string]$ImageName = "tourista:ec2",
  [string]$ContainerName = "tourista-app",
  [int]$HostPort = 80,
  [int]$ContainerPort = 3000
)

$ErrorActionPreference = "Stop"

function Invoke-NativeCommand {
  param(
    [Parameter(Mandatory=$true)]
    [string]$Command,

    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command failed with exit code $LASTEXITCODE"
  }
}

if (!(Test-Path -LiteralPath $KeyPath)) {
  throw "SSH key not found: $KeyPath"
}

if (!(Test-Path -LiteralPath $EnvFile)) {
  throw "Environment file not found: $EnvFile. Create it with DATABASE_URL=..."
}

$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path
$tarPath = Join-Path $env:TEMP "tourista-ec2-image.tar"
$remoteImage = "/home/$User/tourista-ec2-image.tar"
$remoteEnv = "/home/$User/tourista.env"

Write-Host "Building Linux AMD64 Docker image: $ImageName"
Invoke-NativeCommand -Command docker -Arguments @("buildx", "build", "--platform", "linux/amd64", "--load", "-t", $ImageName, $workspace)

Write-Host "Saving image to $tarPath"
Invoke-NativeCommand -Command docker -Arguments @("save", "-o", $tarPath, $ImageName)

Write-Host "Uploading image and env file to $User@$HostName"
Invoke-NativeCommand -Command scp -Arguments @("-i", $KeyPath, $tarPath, "${User}@${HostName}:$remoteImage")
Invoke-NativeCommand -Command scp -Arguments @("-i", $KeyPath, $EnvFile, "${User}@${HostName}:$remoteEnv")

$remoteScript = @"
set -eu
chmod 600 "$remoteEnv"
docker load -i "$remoteImage"
docker rm -f "$ContainerName" || true
docker volume create tourista_uploads >/dev/null
docker run -d \
  --name "$ContainerName" \
  --restart unless-stopped \
  -p "$HostPort`:$ContainerPort" \
  --env-file "$remoteEnv" \
  -v tourista_uploads:/app/public/uploads \
  "$ImageName"
docker image prune -f
docker ps --filter "name=$ContainerName"
"@

Write-Host "Starting container on EC2"
$remoteScript | ssh -i $KeyPath "${User}@${HostName}" "bash -s"
if ($LASTEXITCODE -ne 0) {
  throw "ssh failed with exit code $LASTEXITCODE"
}

Write-Host "Done. Open: http://$HostName"
