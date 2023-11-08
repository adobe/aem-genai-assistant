# AEM GenAI Assistant

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
