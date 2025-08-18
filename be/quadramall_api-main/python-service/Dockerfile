FROM python:3.9.19

RUN apt-get update && apt-get install -y \
    build-essential \
    cron \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --default-timeout=100 -i https://mirrors.aliyun.com/pypi/simple/ numpy==1.21.6
RUN pip install --no-cache-dir --default-timeout=100 -i https://mirrors.aliyun.com/pypi/simple/ -r requirements.txt

# Copy mã nguồn và scripts
COPY src/ src/
COPY start.sh .
COPY crontab /etc/cron.d/python-cron

# Tạo thư mục models
RUN mkdir -p models

# Tạo log file và set permissions
RUN touch /app/app.log && chmod 666 /app/app.log

# Phân quyền crontab và add vào cron
RUN chmod 0644 /etc/cron.d/python-cron && \
    crontab /etc/cron.d/python-cron

# Cấp quyền chạy cho start.sh
RUN chmod +x start.sh

# Set environment variables cho cron
RUN printenv | grep -v "no_proxy" >> /etc/environment

CMD ["./start.sh"]