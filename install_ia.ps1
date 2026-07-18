
Write-Output "Installing PyMySQL..."
$env:PATH = "d:\Stage_IA\IA\venv\Scripts;" + $env:PATH
python -m pip install --timeout 120 -i https://pypi.org/simple pymysql
Write-Output "Done!"
