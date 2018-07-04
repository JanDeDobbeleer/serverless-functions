const gitHubClient = require('../lib/github');

const PythonRequirementsValidator = function() {
    let self = this;
    self.gitHubClient = gitHubClient;

    /**
     * Will loop the git diff and find invalid version pinning changes
     * @param {string} patch
     * @param {Array} invalidVersions - Found invalid versions
     * @return {Array}
     */
    function pushInvalidLines(patch, invalidVersions) {
        // check each line
        patch.split('\n')
            // only take the additions we need
            .filter((line) => line.startsWith('+'))
            .forEach((line) => {
                // remove the '+' char at the beginning
                const cleanedLine = line.slice(1).trim();
                // ignore comments and whitespace
                if (!cleanedLine || cleanedLine.startsWith('#')) {
                    return;
                }
                // only take violations to the PEP 440 rule
                // (https://stackoverflow.com/questions/37972029/regex-to-match-pep440-compliant-version-strings)
                // and allow eggs
                const regex = 'git\\+ssh:\\/\\/git@[\\S]+\.[\\S]+@[\\d]+\.[\\d]+(?:\\.[\\d]+)?#egg=[\\S]+'
                    + '|[\\S]+==(?:\\d+!)?\\d+(?:\\.\\d+)+(?:[\\.\\-\\_]'
                    + '(?:a(?:lpha)?|b(?:eta)?|c|r(?:c|ev)?|pre(?:view)?)\\d*)?(?:\\.?(?:post|dev)\\d*)?'
                    + '|.*\\s#no-qa';
                const matches = cleanedLine.match(regex);
                // if there's no match or the line doesn't equal the entire match, it's invalid
                if (!matches || matches[0] !== cleanedLine) {
                    invalidVersions.push(cleanedLine);
                }
            });
        return invalidVersions;
    }

    /**
     * .Gets the diff for a given pull request and finds incompatible version pinning issues
     * @param {string} prNumber - Number of the Pull Request
     * @param {string} repoName - Repository to fetch information from
     * @param {string} commitHash - SHA1 hash of the commit to set a status for (HEAD)
     */
    self.verifyForInvalidVersionUpgrades = function(prNumber, repoName, commitHash) {
        self.gitHubClient.getPullRequestFiles(repoName, prNumber)
            .then((files) => {
                const requirements = files.filter((file) => file.filename.includes('requirements.txt'));
                let invalidVersions = [];
                requirements.forEach((file) => {
                    pushInvalidLines(file.patch, invalidVersions);
                }, this);
                // get the patch and verify for syntax changes
                let description = 'no requirements.txt issues found, you\'re good to go!';
                let status = self.gitHubClient.COMMITSTATUS.SUCCESS;
                if (invalidVersions.length > 0) {
                    console.log(`Invalid versions in ${repoName}/${prNumber}:\n${invalidVersions.join('\n')}`);
                    description = `Found ${invalidVersions.length} invalid requirements.txt ` +
                        (invalidVersions.length > 1 ? 'entries.' : 'entry.');
                    status = self.gitHubClient.COMMITSTATUS.FAILURE;
                }
                self.gitHubClient
                    .setCommitStatus(repoName, commitHash, status, description, 'github-tools/requirements');
            })
            .catch((error) => {
                console.error('Something went wrong, files aren\'t available');
            });
    };
};

module.exports = new PythonRequirementsValidator();
