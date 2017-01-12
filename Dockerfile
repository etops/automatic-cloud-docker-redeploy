FROM python:2.7-alpine

MAINTAINER Nectar Financial

ADD doRedeploy.py /

CMD [ "python", "./doRedeploy.py" }
