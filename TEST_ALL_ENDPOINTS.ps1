# Comprehensive API Test Script
# Tests all Backend endpoints after fixes

param(
    [string]$BaseUrl = "http://localhost:8080/api",
    [bool]$VerboseOutput = $true
)

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
    $Error = $null
    
    try {
        $Params = @{
            Uri = $Url
            Method = $Method
            ContentType = 'application/json'
            TimeoutSec = 5
        }
        
        if ($Body -ne $null) {
            if ($Body -is [string]) {
                $Params['Body'] = $Body
            } else {
                $Params['Body'] = $Body | ConvertTo-Json
            }
        }
        
        $Response = Invoke-RestMethod @Params
        $Success = $true
        $StatusCode = 200
    }
    catch {
        $Error = $_.Exception.Message
        if ($_.Exception.Response) {
            $StatusCode = [int]$_.Exception.Response.StatusCode
        } else {
            $StatusCode = 0
        }
    }
    
    if ($Success) { $Status = "✅ PASS"; $Color = 'Green' } else { $Status = "❌ FAIL"; $Color = 'Red' }
    Write-Host "$Status | $Method $Path | $Description" -ForegroundColor $Color
    
    if ($VerboseOutput) {
        if ($Success) {
            Write-Host "  → Status: $StatusCode" -ForegroundColor Cyan
            if ($Response) {
                $ResponsePreview = if ($Response -is [string]) { $Response.Substring(0, [Math]::Min(100, $Response.Length)) } else { ($Response | ConvertTo-Json -Depth 1).Substring(0, 100) }
                Write-Host "  → Response: $ResponsePreview..." -ForegroundColor DarkCyan
            }
        } else {
            Write-Host "  → Error: $Error" -ForegroundColor Red
        }
    }
    
    return @{ Success = $Success; StatusCode = $StatusCode; Response = $Response }
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  COMPREHENSIVE API ENDPOINT TEST SUITE                   ║" -ForegroundColor Cyan
Write-Host "║  Testing Backend After /api/api Path Fixes               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test Results
$Results = @{
    Total = 0
    Passed = 0
    Failed = 0
    Critical = 0
    Warning = 0
}

# ============================================
Write-Host "`n📌 SECTION 1: HEALTH & CORE ENDPOINTS`n" -ForegroundColor Yellow
# ============================================

$test = Test-Endpoint -Method "GET" -Path "/health" -Description "Health check endpoint"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Critical++ }

# ============================================
Write-Host "`n📌 SECTION 2: AUTHENTICATION ENDPOINTS`n" -ForegroundColor Yellow
# ============================================

$test = Test-Endpoint -Method "GET" -Path "/auth/debug/users" -Description "Debug: List all users (no auth)"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# ============================================
Write-Host "`n📌 SECTION 3: INVENTORY ENDPOINTS`n" -ForegroundColor Yellow
# ============================================

$test = Test-Endpoint -Method "GET" -Path "/inventory/documents" -Description "Get all documents"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# ============================================
Write-Host "`n📌 SECTION 4: ASSET ENDPOINTS`n" -ForegroundColor Yellow
# ============================================

$test = Test-Endpoint -Method "GET" -Path "/assets" -Description "Get all assets"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# ============================================
Write-Host "`n📌 SECTION 5: AI ENDPOINTS`n" -ForegroundColor Yellow
# ============================================

$test = Test-Endpoint -Method "GET" -Path "/ai/risks" -Description "Get AI-detected risks"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# ============================================
Write-Host "`n📌 SECTION 6: RSSI ENDPOINTS (Recommendations, Reports, Folders, etc)`n" -ForegroundColor Yellow
# ============================================

$test = Test-Endpoint -Method "GET" -Path "/recommendations" -Description "Get recommendations"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

$test = Test-Endpoint -Method "GET" -Path "/reports" -Description "Get reports"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

$test = Test-Endpoint -Method "GET" -Path "/folders" -Description "Get folders"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

$test = Test-Endpoint -Method "GET" -Path "/referentials" -Description "Get referentials"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

$test = Test-Endpoint -Method "GET" -Path "/audit-logs" -Description "Get audit logs"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# ============================================
Write-Host "`n📌 SECTION 7: FIXED /API/API ENDPOINTS (CRITICAL FIXES)`n" -ForegroundColor Yellow
# ============================================

# These were the ones with /api/api prefix issue - NOW SHOULD BE FIXED

$test = Test-Endpoint -Method "GET" -Path "/security-scores/latest" -Description "Get latest security score (FIXED: was /api/security-scores)"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Critical++ }

$test = Test-Endpoint -Method "GET" -Path "/analysis-results" -Description "Get analysis results (FIXED: was /api/analysis-results)"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Critical++ }

$test = Test-Endpoint -Method "GET" -Path "/copilot-history" -Description "Get copilot history (FIXED: was /api/copilot-history)"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Critical++ }

$test = Test-Endpoint -Method "GET" -Path "/notifications" -Description "Get notifications (FIXED: was /api/notifications)"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Critical++ }

# ============================================
Write-Host "`n📌 SECTION 8: ADMIN ENDPOINTS`n" -ForegroundColor Yellow
# ============================================

$test = Test-Endpoint -Method "GET" -Path "/admin/referentials" -Description "Admin: Get referentials"
$Results.Total++; if ($test.Success) { $Results.Passed++ } else { $Results.Failed++; $Results.Warning++ }

# ============================================
Write-Host "`n📌 SECTION 9: VERIFY NO /API/API PATHS EXIST`n" -ForegroundColor Yellow
# ============================================

$test = Test-Endpoint -Method "GET" -Path "/api/security-scores/latest" -Description "Verify /api/api path NO LONGER EXISTS"
if ($test.StatusCode -eq 404) {
    Write-Host "  ✅ CORRECT: Old /api/api path returns 404" -ForegroundColor Green
    $Results.Passed++
} else {
    Write-Host "  ⚠️  WARNING: Old /api/api path still responds ($($test.StatusCode))" -ForegroundColor Yellow
    $Results.Warning++
}
$Results.Total++

# ============================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TEST SUMMARY                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$PercentPass = [Math]::Round(($Results.Passed / $Results.Total) * 100, 1)

Write-Host "Total Tests:     $($Results.Total)" -ForegroundColor White
Write-Host "Passed:          $($Results.Passed)" -ForegroundColor Green
Write-Host "Failed:          $($Results.Failed)" -ForegroundColor Red
Write-Host "Critical Issues: $($Results.Critical)" -ForegroundColor ($Results.Critical -gt 0 ? 'Red' : 'Green')
Write-Host "Warnings:        $($Results.Warning)" -ForegroundColor Yellow
Write-Host "Success Rate:    $PercentPass%" -ForegroundColor ($PercentPass -ge 90 ? 'Green' : ($PercentPass -ge 70 ? 'Yellow' : 'Red'))
Write-Host "`n"

if ($Results.Critical -eq 0 -and $Results.Failed -eq 0) {
    Write-Host "✅ ALL TESTS PASSED - Backend is ready!" -ForegroundColor Green
} elseif ($Results.Critical -eq 0) {
    Write-Host "⚠️  SOME TESTS FAILED - Check warnings" -ForegroundColor Yellow
} else {
    Write-Host "❌ CRITICAL ISSUES - Fix required" -ForegroundColor Red
}
