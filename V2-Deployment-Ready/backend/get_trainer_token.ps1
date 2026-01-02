# Save trainer credentials as JSON
$trainerUserCreds = @{
    username = "sagar" # <-- IMPORTANT: Ensure this matches your actual trainer username
    password = "testpass123" # <-- IMPORTANT: REPLACE THIS with your actual trainer password!
} | ConvertTo-Json

# Send POST request to get token
Write-Host "Getting Trainer Token..."

# --- Debugging Block Starts ---
try {
    # Using the corrected URI for token endpoint
    $trainerTokenResponse = Invoke-WebRequest -Method POST -Uri "http://127.0.0.1:8000/api/token/" `
    -Headers @{ "Content-Type"="application/json" } `
    -Body $trainerUserCreds `
    -ErrorAction Stop ` # Forces PowerShell to throw an error if the request fails
    Select-Object -ExpandProperty Content | ConvertFrom-Json

    # Display the token (only if successful)
    Write-Host "Trainer Token: $($trainerTokenResponse.token)"

    # Store the token in a PowerShell variable for convenience in future commands
    $TRAINER_TOKEN = $trainerTokenResponse.token
    Write-Host "Trainer token saved to \$TRAINER_TOKEN variable."

} catch {
    # This block executes if an error occurs during the Invoke-WebRequest
    Write-Host "An error occurred during trainer token retrieval:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red # Displays the main error message

    # Attempt to extract more details from the server's response if available
    if ($_.Exception.Response) {
        Write-Host "Server Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $responseStream = $_.Exception.Response.GetResponseStream()
            $streamReader = New-Object System.IO.StreamReader($responseStream)
            $responseContent = $streamReader.ReadToEnd()
            $streamReader.Dispose() # Clean up the stream reader

            Write-Host "Server Response Content: $responseContent" -ForegroundColor Red
        } catch {
            Write-Host "Could not read server response content: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "No server response object found (e.g., network error, connection refused)." -ForegroundColor Red
    }
}
# --- Debugging Block Ends ---