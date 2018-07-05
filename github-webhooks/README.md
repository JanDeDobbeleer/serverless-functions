# GitHub Webhooks

These functions handle incoming GitHub webhooks. They are designed to work on pull request events and provide feedback about the code and commits.

## GitHub

Create a webhook on a repository at `repo/settings/hooks`. Enter the following details:

- Payload URL: URL of your deployed function
- Content type: application/json
- Secret: create a secret string and store it somewhere for later use
- Events: _Let me select individual events_. And check **Pull requests**

## Configuration

To configure the functions, the `secrets.production.yml.encrypted` file needs to hold the encrypted variables as listed in `secrets.production.yml.sample`. Copy the file to `secrets.production.yml`. Change to use your credentials.

- GITHUB_WEBHOOK_SECRET: The secret string you entered when creating the POST hook on GitHub
- GITHUB_API_KEY: Your GitHub API key, with access to the repositories

After entering your details, use the serverless secrets plugin to encrypt or decrypt the variables (see the [README](../README.md)).
