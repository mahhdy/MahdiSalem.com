$taskName = "CoverImageQuotaReminder"
$triggerTime = "18:37"

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument @"
-WindowStyle Normal -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('زمان ادامه ساخت تصاویر کاور فرا رسید!`n`nQuota هوش مصنوعی ریست شد.`nبه Antigravity برگرد و ادامه بده:`n- نظارت بین‌المللی بر گذار دموکراتیک ایران`n- معاهده‌ی NPT و نقض‌های آن`n- دادگاه در تبعید', 'یادآوری کاور', 'OK', 'Information')"
"@

$trigger = New-ScheduledTaskTrigger -Once -At "$triggerTime"
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 2)

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force

Write-Host "✅ Reminder scheduled for $triggerTime today!" -ForegroundColor Green
Write-Host "Task name: $taskName" -ForegroundColor Cyan
