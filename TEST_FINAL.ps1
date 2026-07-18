# Final Comprehensive Test - With Authentication
param(
    [string]$Token = "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiUk9MRV9SU1NJIiwic3ViIjoicnNzaSIsImlhdCI6MTc4MzE5MjM0NSwiZXhwIjoxNzgzMjc4NzQ1fQ.CR50l4fc_b2e5kSCWTSRhauzaO9C2r7jOMHzrK6kHbljsEAHPDTYlfXNNnfDp2_5qwlN2gxOGvTKLcL2pU_Odw"
)

$BaseUrl = "http://localhost:8080/api"
$headers = @{ Authorization = "Bearer $Token"; "Content-Type" = "application/json" }
$Results = @{ Total = 0; Passed = 0; Failed = 0 }

Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FINAL COMPREHENSIVE BACKEND TEST WITH AUTHENTICATION" -ForegroundColor Cyan
Write-Host "  Verifying /api/api paths are FIXED" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

function Test-Endpoint {
    param([string]$Method, [string]$Path, [string]$Description)
    
    $Url = "$BaseUrl$Path"
    $Success = $false
    
    try {
        $Params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            TimeoutSec = 5
        }
        
        $Response = Invoke-RestMethod @Params
        $Success = $true
        Write-Host "  OK $Description" -ForegroundColor Green
    }
    catch {
        $Code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode } else { "Error" }
        Write-Host "  FAIL $Description ($Code)" -ForegroundColor Red
    }
    
    $Results.Total++
    if ($Success) { $Results.Passed++ } else { $Results.Failed++ }
}

Write-Host "ENDPOINTS THAT WERE BROKEN (had /api/api prefix):" -ForegroundColor Yellow
Test-Endpoint "GET" "/security-scores/latest" "Security Scores Latest"
Test-Endpoint "GET" "/analysis-results" "Analysis Results"
Test-Endpoint "GET" "/copilot-history" "Copilot History"
Test-Endpoint "GET" "/notifications" "Notifications"

Write-Host "CORE ENDPOINTS (inventory, assets, AI):" -ForegroundColor Yellow
Test-Endpoint "GET" "/inventory/documents" "Inventory Documents"
Test-Endpoint "GET" "/assets" "Assets List"
Test-Endpoint "GET" "/ai/risks" "AI Risks"

Write-Host "RSSI GOVERNANCE ENDPOINTS:" -ForegroundColor Yellow
Test-Endpoint "GET" "/recommendations" "Recommendations"
Test-Endpoint "GET" "/reports" "Reports"
Test-Endpoint "GET" "/folders" "Folders"
Test-Endpoint "GET" "/referentials" "Referentials"
Test-Endpoint "GET" "/audit-logs" "Audit Logs"

Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Total Tests:     $($Results.Total)"
Write-Host "Passed:          $($Results.Passed)" -ForegroundColor Green
Write-Host "Failed:          $($Results.Failed)" -ForegroundColor Red

if ($Results.Failed -eq 0) {
    Write-Host "ALL TESTS PASSED - API PATHS ARE FIXED!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed - review above" -ForegroundColor Yellow
}
