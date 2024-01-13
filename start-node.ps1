$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = "node"
$startInfo.Arguments = "index.js"
$startInfo.RedirectStandardOutput = $true
$startInfo.UseShellExecute = $false
$process = New-Object System.Diagnostics.Process
$process.StartInfo = $startInfo
$process.Start() | Out-Null
$process.Id > "pid.file"
$process.StandardOutput.ReadToEnd() > "output.log"