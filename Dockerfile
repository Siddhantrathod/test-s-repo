# Use an outdated python image to ensure Trivy finds container vulnerabilities
FROM python:3.7

WORKDIR /app

# Copy requirements first for cache
COPY requirements.txt ./

# Install dependencies (may have vulnerable versions)
RUN pip install -r requirements.txt

# Copy application files and .env (intentionally insecure)
COPY . .

# Expose an extra unused port intentionally
EXPOSE 5000 5001

# Start application
CMD ["python", "app/app.py"]
