const gitHubClient = require('../lib/github');

const FixupValidator = function() {
    let self = this;
    self.gitHubClient = gitHubClient;

    /**
     * Fetches the commits for a given pull request and checks for fixup/squash commits.
     * @param {string} prNumber - Number of the Pull Request
     * @param {string} repoName - Repository to fetch information from
     * @param {string} commitHash - SHA1 hash of the commit to set a status for (HEAD)
     */
    self.validateForFixupCommits = function(prNumber, repoName, commitHash) {
        self.gitHubClient.getPullRequestCommits(repoName, prNumber)
            .then((commits) => {
                const messages = commits.map((a) => a.commit.message);
                const fixups = messages
                    .filter((message) => message.startsWith('fixup!') || message.startsWith('squash!'));
                let state = self.gitHubClient.COMMITSTATUS.SUCCESS;
                let description = 'no fixups found, you\'re good to go!';
                if (fixups.length > 0) {
                    state = self.gitHubClient.COMMITSTATUS.FAILURE;
                    description = `found ${fixups.length} fixup ` + (fixups.length > 1 ? 'commits' : 'commit');
                }
                self.gitHubClient.setCommitStatus(repoName, commitHash, state, description, 'github-tools/fixup');
            })
            .catch((error) => {
                console.log(`Could not retrieve commits for Pull Request ${prNumber} on repository ${repoName}`);
            });
    };
};

module.exports = new FixupValidator();
