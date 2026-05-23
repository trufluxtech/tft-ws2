@echo off
echo Checking frontend build...
cd /d %~dp0\..\frontend
npm install
npm run build
echo Checking backend dependencies...
cd /d %~dp0\..\backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python -c "from main import app; print(app.title)"
pause
