# Test Login API - PowerShell Script
Write-Host "`n=== Testing Login API ===" -ForegroundColor Cyan
Write-Host ""

# Login credentials
$body = @{
    phoneNumber = "1234567890"
    password = "password123"
} | ConvertTo-Json

Write-Host "Sending login request..." -ForegroundColor Yellow
Write-Host "Phone: 1234567890" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
    if ($response.data.token) {
        Write-Host ""
        Write-Host "Token: $($response.data.token.Substring(0, 30))..." -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Login Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Check your server console for detailed logs ===" -ForegroundColor Cyan
Write-Host ""
