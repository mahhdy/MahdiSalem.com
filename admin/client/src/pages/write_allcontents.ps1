$enc = [System.Text.UTF8Encoding]::new([bool]0)
$path = 'D:\Code\MahdiSalem.com\admin\client\src\pages\AllContentsManager.tsx'

$content = [System.IO.File]::ReadAllText($path + '.tmp', $enc)
[System.IO.File]::WriteAllText($path, $content, $enc)
Write-Host 'Done'