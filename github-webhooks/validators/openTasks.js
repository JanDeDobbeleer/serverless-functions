const gitHubClient = require('../lib/github');

const OpenTaskValidator = function() {
    let self = this;
    self.gitHubClient = gitHubClient;

    /**
     * Validates if the body (message) of a pull request contains open tasks.
     * @param {string} prNumber - Number of the Pull Request
     * @param {string} repoName - Repository to fetch information from
     * @param {string} commitHash - SHA1 hash of the commit to set a status for (HEAD)
     * @param {string} prBody - Body of the pull request message
     */
    self.validateForOpenTasks = function(prNumber, repoName, commitHash, prBody) {
        const openTasksLeft = /-\s\[\s\]/g.test(prBody);
        if (openTasksLeft)
            self.gitHubClient.setCommitStatus(repoName, commitHash, self.gitHubClient.COMMITSTATUS.FAILURE, 
                'Some tasks are not checked', 'github-tools/openTasks');
        else
            self.gitHubClient.setCommitStatus(repoName, commitHash, self.gitHubClient.COMMITSTATUS.SUCCESS, 
                'All tasks checked.  Ready to go!', 'github-tools/openTasks');
    };
};

module.exports = new OpenTaskValidator();
