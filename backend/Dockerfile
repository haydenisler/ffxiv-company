FROM python:3.12.3-slim

WORKDIR /app
COPY ./requirements* ./

ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8

RUN pip3 install --no-cache -r requirements.txt && pip3 install --no-cache -r requirements-dev.txt
