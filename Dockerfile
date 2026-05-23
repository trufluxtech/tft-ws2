FROM node:20 AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --include=dev

COPY frontend/ ./
RUN npx vite build


FROM python:3.11-slim

WORKDIR /app

COPY backend/ ./backend
COPY --from=frontend-build /app/frontend/dist ./backend/static

WORKDIR /app/backend

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
