const github = require('octonode');

/**
 * @typedef {string} CommitStatus
 **/

const GitHubClient = function(apiKey) {
    let self = this;
    self.client = github.client(apiKey);

    /**
     * @enum {CommitStatus}
     */
    self.COMMITSTATUS = {
        FAILURE: 'failure',
        SUCCESS: 'success',
    };

    /**
     * @param {string} endpoint - The GitHub endpoint to fetch data from
     * @return {Promise}
     */
    function getApiResult(endpoint) {
        return new Promise((resolve, reject) => {
            self.client.get(endpoint, {}, function(err, status, body, headers) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(body);
            });
        });
    }

    /**
     *
     * @param {string} repoName - Repository fullname to set commit status on
     * @param {string} commitHash - Commit hash to set status on
     * @param {CommitStatus} state - The commit state
     * @param {string} description - A description for the validator
     * @param {string} context - Unique identifier for the validator
     */
    self.setCommitStatus = function(repoName, commitHash, state, description, context) {
        let ghrepo = self.client.repo(repoName);
        ghrepo.status(commitHash, {
            'state': state,
            'description': description,
            'context': context,
        }, (err, data, headers) => {
            if (err) {
                console.log('error: ' + err);
                console.log('data: ' + data);
                console.log('headers:' + headers);
                return;
            }
            console.log('Commit status successfully set');
        });
    };

    /**
     *
     * @param {string} repoName - Repository to fetch commits from
     * @param {string} prNumber - Pull Request number to fetch commits for
     * @return {Promise}
     */
    self.getPullRequestCommits = function(repoName, prNumber) {
        return getApiResult(`/repos/${repoName}/pulls/${prNumber}/commits`);
    };

    /**
     *
     * @param {string} repoName - Repository to fetch files from
     * @param {string} prNumber - Pull Request number to fetch files for
     * @return {Promise}
     */
    self.getPullRequestFiles = function(repoName, prNumber) {
        return getApiResult(`/repos/${repoName}/pulls/${prNumber}/files`);
    };
};

module.exports = new GitHubClient(process.env.GITHUB_API_KEY);
