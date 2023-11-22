# AEM Generate Content Variations Sidekick Plugin

Follow these instructions to integrate this powerful tool into your website.

## Getting Started

### Setting Up AEM Generate Content Variations

To activate the AEM Generate Content Variations on your Edge Delivery Services website, it's necessary to include the following code into your Sidekick configuration at `tools/sidekick/config.json`:
```json5
{
  // ...
  "plugins": [
    // ...
    {
      "id": "generate-content-variations",
      "title": "Generate Content Variations",
      "url": "<coming soon>",
      "passConfig": true,
      "environments": ["edit"],
      "includePaths": ["**.docx**"]
    }
    // ...
  ]
}
```

### Creating Dynamic Prompt Templates

Placeholders make prompt templates flexible and reusable. They are special spots in a template where users can input customized values. When a prompt with placeholders is run, these spots are filled with the user's specific inputs, making the prompt tailored for the situation.

#### Placeholder Syntax

A placeholder is an expression defined as a sequence enclosed in curly braces {}. It may optionally start with a modifier, followed by an identifier and optional parameters. 

`{@placeholder, label="Placeholder"}`

#### Modifiers

A modifier is a single character, either # or @, used to modify the behavior of the expression.
- `#` is used for comments that the language model does not see.
- `@` transforms an expression into a definition that remains hidden from LLM. Definitions organize parameters outside the template, making prompts cleaner and easier to manage.

#### Parameters

Parameters are a list of key-value pairs, providing additional information or configuration for the expression.

Each parameter is defined as a key-value pair, separated by an equals sign `=`. Parameters themselves are separated from each other by commas `,`.
The value in a key-value pair can be either a simple string or a quoted string.

The list of supported parameters:
- `label` - The label to display for the placeholder. If not provided, the placeholder will be displayed as the identifier transformed into a user-friendly format.
- `description` - The description to display for the placeholder.
- `type` - The type of input to expect from the user. If not provided, the placeholder will be displayed as a text input.
- `default` - The default value to use for the placeholder. If not provided, the placeholder will be displayed as an empty input.
- `spreadsheet` - The name of the spreadsheet from which to read the values for the dropdown list. This parameter sets the type to `select`.
The list of supported types:
- `text` - A multi-line text input (default).
- `number` - A number.
- `select` - A drop-down list of values.

## Development Guidelines

### Initial Setup

- Populate the `.env` file in the project root and fill it as shown [below](#env)

### Local Development

- `npm start` to start your local Dev server
  - App will run on `localhost:9080` by default
  - Actions will be deployed locally (requires Docker running)

### Testing

- Run `npm test` to run unit tests for ui and actions

### Deployment

- `npm run deploy` to build and deploy all actions on Runtime and static files to CDN

### Configuration

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
