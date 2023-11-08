# AEM GenAI Assistant

## Creating Prompt Templates

### Using Placeholders
Placeholders make prompt templates flexible and reusable. They are special spots in a template where users can input customized values. When a prompt with placeholders is run, these spots are filled with the user's specific inputs, making the prompt tailored for the situation.

A placeholder is an expression defined as a sequence enclosed in curly braces {}. It may optionally start with a modifier, followed by an identifier and optional parameters. 

`{@placeholder, label="Placeholder"}`

A modifier is a single character, either # or @, used to modify the behavior of the expression.
- `#` is used for comments that the language model does not see.
- `@` transforms an expression into a definition that remains hidden from LLM. Definitions organize parameters outside the template, making prompts cleaner and easier to manage.

Parameters are a list of key-value pairs, providing additional information or configuration for the expression.

Each parameter is defined as a key-value pair, separated by an equals sign `=`. Parameters themselves are separated from each other by commas `,`.
The value in a key-value pair can be either a simple string or a quoted string.

## Setup

- Populate the `.env` file in the project root and fill it as shown [below](#env)

## Local Dev

- `npm start` to start your local Dev server
- App will run on `localhost:9080` by default

## Test & Coverage

- Run `npm test` to run unit tests for ui and actions

## Deploy & Cleanup

- `npm run deploy` to build and deploy all actions on Runtime and static files to CDN

## Config

### `.env`

You can generate this file using the command `aio app use`. 

```bash
## React app
REACT_APP_API_ENDPOINT=...

## Runtime action
FIREFALL_ENDPOINT=...
FIREFALL_API_KEY=...
FIREFALL_IMS_ORG=...
IMS_ENDPOINT=...
IMS_CLIENT_ID=...
IMS_CLIENT_SECRET=...
```
