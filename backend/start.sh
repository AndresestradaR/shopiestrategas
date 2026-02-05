#!/bin/sh
echo "Starting MiniShop backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
