const crypto = require('crypto');

/**
 * Sign the body based on the provided SHA1 key
 * @param {string} key
 * @param {string} body
 * @return {string} The signing key
 */
function signRequestBody(key, body) {
    return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}

const RequestValidator = function() {
    let self = this;

    /**
     * Validates the request based on how GitHub executes it.
     * Looks for required 'X' headers and if the body has been properly signed.
     * @param {object} headers - Request headers
     * @param {string} body - Request body
     * @return {Promise}
     */
    self.validateGitHubRequest = function(headers, body) {
        const token = process.env.GITHUB_WEBHOOK_SECRET;
        const sig = headers['X-Hub-Signature'];
        const githubEvent = headers['X-GitHub-Event'];
        const id = headers['X-GitHub-Delivery'];
        const calculatedSig = signRequestBody(token, body);
        let result = {
            'message': '',
            'statusCode': 200,
        };

        if (typeof token !== 'string') {
            result.message = 'Must provide a \'GITHUB_WEBHOOK_SECRET\' env variable';
            result.statusCode = 401;
        }

        if (!sig) {
            result.message = 'No X-Hub-Signature found on request';
            result.statusCode = 401;
        }

        if (!githubEvent) {
            result.message = 'No X-GitHub-Event found on request';
            result.statusCode = 422;
        }

        if (!id) {
            result.message = 'No X-GitHub-Delivery found on request';
            result.statusCode = 401;
        }

        if (sig !== calculatedSig) {
            result.message = 'X-Hub-Signature incorrect. Github webhook token doesn\'t match';
            result.statusCode = 401;
        }

        return new Promise((resolve, reject) => {
            if (result.statusCode === 200) {
                resolve(result);
                return;
            }
            reject(result);
        });
    };
};

module.exports = new RequestValidator();
