import dockercloud
import urllib2
import os
import threading

serverUrl = os.getenv('SERVER_URL')
serviceID = os.getenv('DOCKER_SERVICE_ID')
dockercloud.user = os.getenv('DOCKER_USERNAME')
dockercloud.apikey  = os.getenv('DOCKER_API_KEY')
urlToCheck = os.getenv('SERVICE_URL')
dockercloud.namespace = "etops"

def healthChecker():
  threading.Timer(10*60, work).start ()
  try:
      urllib2.urlopen(urlToCheck)
  except urllib2.HTTPError, e:
      print(e.code)
      if e.code == 502:
        service = dockercloud.Service.fetch(serviceID)
        service.redeploy()
  except urllib2.URLError, e:
      print(e.args)

healthChecker()
