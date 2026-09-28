FROM python:3.12-alpine

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV DATA_DIR=/data
RUN mkdir -p /data

EXPOSE 3000

CMD ["gunicorn", "--workers", "2", "--bind", "0.0.0.0:3000", "wsgi:app"]
