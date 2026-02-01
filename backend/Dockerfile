FROM python:3.10-slim

WORKDIR /app

# install dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# copy source
COPY . /app

EXPOSE 8000

# default command (docker-compose overrides with --reload for dev)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
