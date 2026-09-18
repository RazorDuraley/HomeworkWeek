Write-Host "Сборка..." -ForegroundColor Cyan
cd HomeworkApi
dotnet publish -c Release -o ./publish

Write-Host "Загрузка на VPS..." -ForegroundColor Cyan
scp -r .\publish\* root@193.178.158.58:/var/www/homework-api/

Write-Host "Перезапуск сервиса..." -ForegroundColor Cyan
ssh root@193.178.158.58 "systemctl restart homework-api"

Write-Host "Готово! https://iv-623top.duckdns.org" -ForegroundColor Green