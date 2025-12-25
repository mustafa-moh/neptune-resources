Param(
    [string]$KeyDir = (Join-Path (Split-Path -Parent $PSScriptRoot) "vault-keys"),
    [string]$EnvFile = (Join-Path (Split-Path -Parent $PSScriptRoot) ".env"),
    [switch]$UpdateEnv,
    [switch]$WriteExample,
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-CommandAvailable {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Ensure-Directory {
    param([string]$Path)
    if (!(Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function New-VaultKeys {
    param(
        [string]$TargetDir,
        [switch]$Overwrite
    )
    $privKey = Join-Path $TargetDir "vault"
    $pubKey = Join-Path $TargetDir "vault.pub"
    $pemKey = Join-Path $TargetDir "vault.pem"

    $anyExisting = (Test-Path $privKey) -or (Test-Path $pubKey) -or (Test-Path $pemKey)
    if ($anyExisting -and -not $Overwrite) {
        Write-Host "Vault keys already exist at '$TargetDir'. Use -Force to overwrite." -ForegroundColor Yellow
        return
    }
    if ($anyExisting -and $Overwrite) {
        Get-ChildItem -LiteralPath $TargetDir -Filter "vault*" | Remove-Item -Force
    }

    Push-Location $TargetDir
    try {
        & ssh-keygen -t rsa -b 4096 -m PEM -f vault -N "" -q
        if ($LASTEXITCODE -ne 0) { throw "ssh-keygen failed while creating the private/public keypair." }
        & ssh-keygen -f vault.pub -e -m PEM > vault.pem
        if ($LASTEXITCODE -ne 0) { throw "ssh-keygen failed while exporting the public key to PEM." }
    }
    finally {
        Pop-Location
    }
}

function Set-EnvLine {
    param(
        [string]$FilePath,
        [string]$Name,
        [string]$Value
    )
    $lines = @()
    if (Test-Path -LiteralPath $FilePath) {
        $raw = Get-Content -LiteralPath $FilePath -Raw
        $lines = $raw -split "`r?`n"
    }
    $pattern = "^\s*{0}\s*=" -f [regex]::Escape($Name)
    $index = ($lines | Select-String -Pattern $pattern).LineNumber
    if ($index) {
        $lines[$index - 1] = "$Name=$Value"
    } else {
        $lines += "$Name=$Value"
    }
    $out = ($lines -join "`r`n").TrimEnd() + "`r`n"
    Set-Content -LiteralPath $FilePath -Value $out -Encoding utf8
}

function Write-EnvExample {
    param([string]$ExamplePath)
    $content = @"
#
# Neptune DXP - Open Edition: Vault configuration
# Docs:
# - Enable the Vault in the .env file: https://docs.neptune-software.com/neptune-dxp-open-edition/24/cockpit-overview/vault-of-secrets.html#_enable_the_vault_in_the_env_file
# - Create env file for Vault: https://docs.neptune-software.com/neptune-dxp-open-edition/24/cockpit-overview/vault-of-secrets-create-env-file.html
#

# Enable or disable the Vault feature
VAULT_ENABLED=true

# Absolute host path to the Vault key directory. If not set, docker-compose uses ./vault-keys
# Example (Windows): D:\Projects\Neptune\neptune-resources\local-development\vault-keys
# Example (macOS/Linux): /Users/you/projects/neptune/local-development/vault-keys
VAULT_KEYS_HOST_DIR=

# In-container key locations (should match docker-compose mount target)
VAULT_PRIVATE_KEY=/run/vault-keys/vault
VAULT_PUBLIC_KEY=/run/vault-keys/vault.pem
"@
    Set-Content -LiteralPath $ExamplePath -Value $content -Encoding utf8 -NoNewline
}

# Preconditions
if (-not (Test-CommandAvailable "ssh-keygen")) {
    throw "ssh-keygen is required but was not found in PATH. Install OpenSSH (Windows Optional Feature) or Git for Windows which includes ssh-keygen."
}

Ensure-Directory -Path $KeyDir
New-VaultKeys -TargetDir $KeyDir -Overwrite:$Force

if ($UpdateEnv) {
    $resolvedKeyDir = (Resolve-Path -LiteralPath $KeyDir).Path
    Set-EnvLine -FilePath $EnvFile -Name "VAULT_ENABLED" -Value "true"
    Set-EnvLine -FilePath $EnvFile -Name "VAULT_KEYS_HOST_DIR" -Value $resolvedKeyDir
    # These are in-container defaults; override only if you also change docker-compose mount target
    Set-EnvLine -FilePath $EnvFile -Name "VAULT_PRIVATE_KEY" -Value "/run/vault-keys/vault"
    Set-EnvLine -FilePath $EnvFile -Name "VAULT_PUBLIC_KEY" -Value "/run/vault-keys/vault.pem"
}

if ($WriteExample) {
    $examplePath = (Join-Path (Split-Path -Parent $PSScriptRoot) ".env.example")
    Write-EnvExample -ExamplePath $examplePath
}

Write-Host ""
Write-Host "Vault initialization complete." -ForegroundColor Green
Write-Host "Key directory: $KeyDir"
if ($UpdateEnv) {
    Write-Host "Updated .env at: $EnvFile" -ForegroundColor Cyan
    Write-Host "Remember to restart the stack:" -ForegroundColor Yellow
    Write-Host "  docker compose down" 
    Write-Host "  docker compose up -d"
} else {
    Write-Host "Tip: Re-run with -UpdateEnv to write VAULT_* to your .env" -ForegroundColor Yellow
}


