FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements/ ./requirements/
RUN pip install --no-cache-dir -r requirements/production.txt

COPY backend/ .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --timeout 120
