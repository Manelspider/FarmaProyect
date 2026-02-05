FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar proyecto
COPY . .

# Puerto para Gunicorn
EXPOSE 18000

# Comando para ejecutar con Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:18000", "--workers", "3", "config.wsgi:application"]
