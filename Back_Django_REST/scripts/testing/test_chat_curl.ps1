# Script para probar el endpoint de chat con curl
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM2MDIxMjMzLCJpYXQiOjE3MzYwMTc2MzMsImp0aSI6ImJiMGQxYjg0ZWE1OTRlNzhhYWRjMDk3YTlmZGE3NzAyIiwidXNlcl9pZCI6OH0.oZmRXhBCkCb3I3N0PjE6k6jZdV3_qzXqnPg0" # Reemplazar con tu token

$body = @{
    receiver_id = 5
    content = "Test desde PowerShell"
} | ConvertTo-Json

Write-Host "Enviando POST a http://localhost:8000/api/chat/send/"
Write-Host "Body: $body"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/chat/send/" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Error Response: $responseBody"
}
