# Comprehensive API Test Script - Fixed Version
# Tests all Backend endpoints after /api/api fixes

$BaseUrl = "http://localhost:8080/api"
$VerboseOutput = $true

$Results = @{ Total = 0; Passed = 0; Failed = 0; Critical = 0; Warning = 0 }

Write-Host "`n=== COMPREHENSIVE API ENDPOINT TEST SUITE ===" -ForegroundColor Cyan
Write-Host "Testing Backend After /api/api Path Fixes`n" -ForegroundColor Cyan

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Description
    )
    
    $Url = "$BaseUrl$Path"
    $Success = $false
    $Response = $null
    $StatusCode = 0
    $Error = ""
    
    try {
        $Params = @{
            Uri = $Url
            Method = $Method
            ContentType = 'application/json'
            TimeoutSec = 5
        }
        
        if ($Body -ne $null) {
            $Params['Body'] = if ($Body -is [string]) { $Body } else { $Body | ConvertTo-Json }
        }
        
        $Response = Invoke-RestMethod @Params
        $Success = $true
        $StatusCode = 200
    }
    catch {
        $Error = $_.Exception.Message
        $StatusCode = 0
        if ($_.Exception.Response) {
            $StatusCode = [int]$_.Exception.Response.StatusCode
        }
    }
    
    if ($Success) {
        Write-Host "PASS | $Method $Path | $Description" -ForegroundColor Green
    } else {
        Write-Host "FAIL | $Method $Path | $Description (Status: $StatusCode)" -ForegroundColor Red
    }
    
    return @{ Success = $Success; StatusCode = $StatusCode; Response = $Response }
}

# Health Check
Write-Host "`n--- HEALTH CHECK ---" -ForegroundColor Yellow
$test = Test-Endpoint -Method "GET" -Path "/health" -Description "Health"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Critical++ }

# Authentication
Write-Host "`n--- AUTHENTICATION ---" -ForegroundColor Yellow
$test = Test-Endpoint -Method "GET" -Path "/auth/debug/users" -Description "Debug Users"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# Inventory
Write-Host "`n--- INVENTORY ---" -ForegroundColor Yellow
$test = Test-Endpoint -Method "GET" -Path "/inventory/documents" -Description "Get Documents"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# Assets
Write-Host "`n--- ASSETS ---" -ForegroundColor Yellow
$test = Test-Endpoint -Method "GET" -Path "/assets" -Description "Get Assets"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# AI
Write-Host "`n--- ARTIFICIAL INTELLIGENCE ---" -ForegroundColor Yellow
$test = Test-Endpoint -Method "GET" -Path "/ai/risks" -Description "Get Risks"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# RSSI Endpoints
Write-Host "`n--- RSSI GOVERNANCE ---" -ForegroundColor Yellow
$test = Test-Endpoint -Method "GET" -Path "/recommendations" -Description "Get Recommendations"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

$test = Test-Endpoint -Method "GET" -Path "/reports" -Description "Get Reports"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

$test = Test-Endpoint -Method "GET" -Path "/folders" -Description "Get Folders"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

$test = Test-Endpoint -Method "GET" -Path "/referentials" -Description "Get Referentials"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

$test = Test-Endpoint -Method "GET" -Path "/audit-logs" -Description "Get Audit Logs"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# FIXED /api/api ENDPOINTS
Write-Host "`n--- CRITICAL FIXES (was /api/api, now FIXED) ---" -ForegroundColor Magenta

$test = Test-Endpoint -Method "GET" -Path "/security-scores/latest" -Description "Security Scores (FIXED)"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Critical++ }

$test = Test-Endpoint -Method "GET" -Path "/analysis-results" -Description "Analysis Results (FIXED)"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Critical++ }

$test = Test-Endpoint -Method "GET" -Path "/copilot-history" -Description "Copilot History (FIXED)"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Critical++ }

$test = Test-Endpoint -Method "GET" -Path "/notifications" -Description "Notifications (FIXED)"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Critical++ }

# Verify old paths don't exist
Write-Host "`n--- VERIFY OLD /api/api PATHS DELETED ---" -ForegroundColor Magenta
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/api/security-scores/latest" -TimeoutSec 5
    Write-Host "FAIL | Old /api/api path still exists!" -ForegroundColor Red
    $Results.Failed++
    $Results.Critical++
}
catch {
    if ($_.Exception.Response.StatusCode -eq "NotFound") {
        Write-Host "PASS | Old /api/api path correctly removed" -ForegroundColor Green
        $Results.Passed++
    } else {
        Write-Host "FAIL | Unexpected status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $Results.Failed++
    }
}
$Results.Total++

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total:      $($Results.Total)"
Write-Host "Passed:     $($Results.Passed)" -ForegroundColor Green
Write-Host "Failed:     $($Results.Failed)" -ForegroundColor Red
Write-Host "Critical:   $($Results.Critical)" -ForegroundColor Magenta
Write-Host "Warnings:   $($Results.Warning)" -ForegroundColor Yellow

if ($Results.Critical -eq 0 -and $Results.Failed -eq 0) {
    Write-Host "`n✅ SUCCESS - All tests passed!" -ForegroundColor Green
} elseif ($Results.Critical -eq 0) {
    Write-Host "`n⚠️  WARNINGS - Check non-critical failures" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ CRITICAL - Fix required!" -ForegroundColor Red
}
