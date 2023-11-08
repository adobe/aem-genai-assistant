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

The list of supported parameters are:
- `label` - The label to display for the placeholder. If not provided, the placeholder will be displayed as the identifier transformed into a user-friendly format.
- `description` - The description to display for the placeholder.
- `type` - The type of input to expect from the user. If not provided, the placeholder will be displayed as a text input.
  - The list of supported types:
    - `string` - A multi-line text input (default).
    - `number` - A number.
    - `spreadsheet` - A drop-down list of values from a spreadsheet.
- `spreadsheet` - The name of the spreadsheet to use for the placeholder. If not provided, the placeholder will be displayed as a text input. This parameter sets the type to `spreadsheet`.

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
