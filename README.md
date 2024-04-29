# AEM Generate Variations App

## Documentation

See: http://aem.live/docs/sidekick-generate-variations

## Development Guidelines

### Initial Setup

- Check that you have access to [App Builder](https://developer.adobe.com/app-builder/) and [Developer Console](https://developer.adobe.com/console) (log in with the **Sites Internal** profile)
    - Request access from an IT admin
- Install dependencies: `npm install`
- Select an organization, project, and workspace:
    - `aio console org select`
    - `aio console project select`
    - `aio console workspace select`
- Populate the `.env` file in the project root and fill it as shown [below](#env)

### Local Development

- `npm start` to start your local Dev server
  - App will run on `localhost:9080` by default
  - Actions will be deployed locally (requires Docker running)

### Testing

- Run `npm run lint && npm test` to run lint and unit tests for ui and actions
- Preview the Generate Variations app in the [QA workspace](https://experience-qa.adobe.com/?shell_source=local&devMode=true&shell_ims=prod#/aem/generate-variations/): `npm run preview`

### Deployment

- `npm run deploy` to build and deploy all actions on Runtime and static files to CDN

### Configuration

### `.env`

Make a copy of `.env.template` and rename it to `.env`. Fill in the values as shown below. To fill in the values for AIO Runtime, run `aio app use` on the CLI and select the correct values for your project. When asked, select `merge` to merge the values with the existing `.env` file.

```bash
# AIO Runtime environment variables (run `aio app use` on the CLI to set these)
AIO_runtime_auth=
AIO_runtime_namespace=
AIO_runtime_apihost=

# AIO Logging environment variables
AIO_LOG_LEVEL=info

## Firefall environment variables
FIREFALL_API_KEY=aem-genai-assistant
FIREFALL_ENDPOINT=https://firefall.adobe.io # or https://firefall-stage.adobe.io

## IMS environment variables
IMS_ENDPOINT=https://ims-na1.adobelogin.com # or https://ims-na1-stg1.adobelogin.com
IMS_PRODUCT_CONTEXT=dma_aem_cloud
IMS_CLIENT_ID=aem-genai-assistant # This is the IMSS client ID for validating service tokens and checking the product context
IMS_SERVICE_CLIENT_ID=aem-sidekick-genai-assistant # This is the IMSS client ID for generating a service token. This ID is associated with the FIREFALL_API_KEY.
IMS_SERVICE_CLIENT_SECRET=
IMS_SERVICE_PERM_AUTH_CODE=

## Splunk environment variables
SPLUNK_HEC__HEC_TOKEN=
```
