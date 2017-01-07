const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "automatic-cloud-docker-redeploy"});
const rp = require('request-promise');
const errors = require('request-promise/errors');
const DockerCloud = require('dockercloud');

const urlToCheck = process.env.SERVER_URL;
const dockerServiceName = process.env.DOCKER_SERVICE_NAME;
const dockerUsername = process.env.DOCKER_USERNAME;
const dockerPassword = process.env.DOCKER_PASSWORD;
const dockerServiceID = process.env.DOCKER_SERVICE_ID;

if (!urlToCheck) {
  log.fatal('missing SERVER_URL environment varialbe');
}

if(!dockerServiceName) {
  log.fatal('missing DOCKER_SERVICE_NAME environment variable')
}

const service = await dockerCloud.findServiceById(dockerServiceID);

log.info("started");

setTimeout(checkServerStatus, 15*60*1000);

const checkServerStatus = () => {
  rp({ uri: urlToCheck, resolveWithFullResponse: true })
  .then(response => {
    log.info(`${urlToCheck} is running`);
  })
  .catch(errors.StatusCodeError, function (reason) {
      // The server responded with a status codes other than 2xx.
      // Check reason.statusCode
      if(reasons.statusCode === 502) {
        // login to docker
        const dockerCloud = new DockerCloud(dockerUsername, dockerPassword);
        dockerCloud.redeployService(service)
          .then(() => {
            log.info(`${urlToCheck} was restarted`);
          });
      }
  })
  .catch(errors.RequestError, function (reason) {
      // The request failed due to technical reasons.
      // reason.cause is the Error object Request would pass into a callback.
      log.fatal(reason);
  });

  setTimeout(checkServerStatus, (Math.random()*15+5)*60*1000);
}


