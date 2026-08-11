FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements/ ./requirements/
RUN pip install --no-cache-dir -r requirements/production.txt

COPY backend/ .

RUN chmod +x start.sh && python manage.py collectstatic --noinput

EXPOSE 8000

CMD ./start.sh
