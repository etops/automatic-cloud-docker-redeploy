const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "automatic-cloud-docker-redeploy"});
const rp = require('request-promise');
const errors = require('request-promise/errors');
import DockerCloud from 'dockercloud'

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

log.info("started");

const checkServerStatus = () => {
  log.info("check status");
  rp({ uri: urlToCheck, resolveWithFullResponse: true })
  .then(response => {
    log.info(`${urlToCheck} is running`);
  })
  .catch(errors.StatusCodeError, function (reason) {
      // The server responded with a status codes other than 2xx.
      // Check reason.statusCode
      log.info(reason.statusCode);
      if(reason.statusCode === 502) {
        console.log("====>");
        // login to docker
        const dockerCloud = new DockerCloud(dockerUsername, dockerPassword, 'etops');
        console.log(dockerServiceID);
        dockerCloud.findServiceById(dockerServiceID)
          .then((service) => {
            console.log(service);
            dockerCloud.redeployService(service)
              .then(() => {
                log.info(`${urlToCheck} was restarted`);
              }).catch((err) => {
                console.log(err);
              });
          }).catch((err) => {
            console.log(err);
          });

      }
  })
  .catch(errors.RequestError, function (reason) {
      // The request failed due to technical reasons.
      // reason.cause is the Error object Request would pass into a callback.
      log.fatal(reason);
  });

  //setTimeout(checkServerStatus, (Math.random()*15+5)*1*1000);
}


setTimeout(checkServerStatus, 0.5*10*1000);


