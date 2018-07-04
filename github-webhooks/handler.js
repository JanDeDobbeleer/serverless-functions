const requestValidator = require('./lib/requestValidation');
const fixupValidator = require('./validators/fixupCommits');
const pythonRequirementsValidator = require('./validators/pythonRequirements');

/**
 * Returns the error to the client based on the provided message
 * @param {string} message
 * @param {*} statusCode
 * @param {*} callback
 */
function respond(message, statusCode, callback) {
  callback(null, {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'text/plain',
    },
    body: message,
  });
}

/**
 *
 * @param {object} event - The incoming event data
 * @param {object} callback - The callback handling the webhook response
 * @return {Promise}
 */
function handleRequest(event, callback) {
  return new Promise((resolve, reject) => {
    requestValidator.validateGitHubRequest(event.headers, event.body)
      .then((result) => {
        respond(result.message, result.statusCode, callback);
        const data = JSON.parse(event.body);
        resolve(data);
      })
      .catch((result) => {
        respond(result.message, result.statusCode, callback);
      });
  });
}

module.exports.fixupCommits = (event, context, callback) => {
  handleRequest(event, callback)
    .then((data) => {
      fixupValidator.validateForFixupCommits(
        data.pull_request.number,
        data.pull_request.head.repo.full_name,
        data.pull_request.head.sha);
    });
};

module.exports.pythonRequirements = (event, context, callback) => {
  handleRequest(event, callback)
    .then((data) => {
      pythonRequirementsValidator.verifyForInvalidVersionUpgrades(
        data.pull_request.number,
        data.pull_request.head.repo.full_name,
        data.pull_request.head.sha);
    });
};
