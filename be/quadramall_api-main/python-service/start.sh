#!/bin/bash

echo "=== Starting Python Service $(date) ===" >> /app/app.log

# Tạo thư mục models
mkdir -p /app/models

# Chạy train.py ngay khi khởi động
echo "Running initial training..." >> /app/app.log
python /app/src/train.py

# Khởi động cron service
echo "Starting cron service..." >> /app/app.log
service cron start

# Check cron status
echo "Cron status:" >> /app/app.log
service cron status >> /app/app.log

# List active crontab
echo "Active crontab:" >> /app/app.log
crontab -l >> /app/app.log

# Chạy recommend.py nền
echo "Starting recommend service..." >> /app/app.log
python /app/src/recommend.py &

# Giữ container chạy và theo dõi log
echo "Service started successfully. Monitoring logs..." >> /app/app.log
tail -f /app/app.log