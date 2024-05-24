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

### Testing

- Run `npm run lint && npm test` to run lint and unit tests for ui and actions
- Preview the Generate Variations app in the [QA workspace](https://experience-qa.adobe.com/?shell_source=local&devMode=true&shell_ims=prod#/aem/generate-variations/): `npm run preview`

### Debugging

By default, App Builder stores only failed activations. To enable the storage of all App Builder activations, set the `extraLogging` search query parameter to `true`, as shown in the following example:

```
https://experience.adobe.com/?extraLogging=true#/aem/generate-variations/
```

### Deployment

- `npm run deploy` to build and deploy all actions on Runtime and static files to CDN
- `QA` and `Production` workspaces are protected from accidental local deployments with `pre-app-deploy` App Builder hook

#### Deployment Strategy
- CI/CD handles the rollout to prod and QA envs.
- Deployments for testing and checking out PRs should happen locally. Here, the script goes into interactive mode to guide a dev to switch to the correct env:
  - If the matching AdobeIO workspace exists, it'll deploy there.
  - If there isn't a matching AdobeIO workspace, it'll help create one.
  - In both scenarios, a dev can opt out and select a workspace manually from the list.

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
FIREFALL_API_KEY=aem-sidekick-genai-assistant
FIREFALL_ENDPOINT=https://firefall.adobe.io # or https://firefall-stage.adobe.io

## IMS environment variables
IMS_ENDPOINT=https://ims-na1.adobelogin.com # or https://ims-na1-stg1.adobelogin.com
IMS_PRODUCT_CONTEXT=dma_aem_cloud
IMS_CLIENT_ID=aem-genai-assistant # This is the IMSS client ID for validating service tokens and checking the product context
IMS_SERVICE_CLIENT_ID=aem-sidekick-genai-assistant # This is the IMSS client ID for generating a service token. This ID is associated with the FIREFALL_API_KEY.
IMS_SERVICE_CLIENT_SECRET=
IMS_SERVICE_PERM_AUTH_CODE=

## Access Profile environment Variables
PRODUCT_ENTITLEMENT=dx_aem_edge_delivery_services
EXPRESS_ENTITLEMENT=spark
ACCESS_PLATFORM_APP_ID=AemGenerateVariations
ACCESS_PLATFORM_CLIENT_ID=aem-genai-assistant
ACCESS_PROFILE_ENDPOINT=https://aps-web.adobe.io

## Splunk environment variables
SPLUNK_HEC__HEC_TOKEN=

## Launch Darkly environment variables
FT_EARLY_ACCESS=
LD_SDK_KEY=
```

In addition, the following values need to be manually set (request from a teammate or admin):
- `IMS_SERVICE_CLIENT_SECRET`
- `IMS_SERVICE_PERM_AUTH_CODE`
- `SPLUNK_HEC__HEC_TOKEN`
- `EXPRESS_PRODUCT_CONTEXT`
- `EXPRESS_SDK_URL`
- `TARGET_API_KEY`
- `FT_EARLY_ACCESS`
- `LD_SDK_KEY`
