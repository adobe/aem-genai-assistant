const wretch = require('wretch')
const FormDataAddon = require('wretch/addons/formData')
const retry = require('wretch/middlewares/retry')

const GPT_35_TURBO = 'gpt-35-turbo'
const GPT_4 = 'gpt-4'

async function getAccessToken(params) {
  const IMSS_ENDPOINT = 'https://ims-na1.adobelogin.com'
  const IMSS_CLIENT_ID = params.IMSS_CLIENT_ID
  const IMSS_CLIENT_SECRET = params.IMSS_CLIENT_SECRET
  const IMSS_SERVICE_PERMANENT_AUTHORIZATION_CODE = params.IMSS_SERVICE_PERMANENT_AUTHORIZATION_CODE

  const imssAccessTokenResponse = await wretch(IMSS_ENDPOINT + '/ims/token/v1')
    .post({
      client_id: IMSS_CLIENT_ID,
      client_secret: IMSS_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: IMSS_SERVICE_PERMANENT_AUTHORIZATION_CODE
    })

  return imssAccessTokenResponse.json().access_token
}

async function completion(params, accessToken, prompt, llm_metadata) {
  const FIREFALL_ENDPOINT = 'https://firefall.adobe.io'
  const FIREFALL_API_KEY = params.FIREFALL_API_KEY
  const FIREFALL_IMSS_ORG = params.FIREFALL_IMSS_ORG

  const response = await wretch(FIREFALL_ENDPOINT + '/v1/completions')
    .headers({
      Authorization: `Bearer ${accessToken}`,
      'x-api-key': FIREFALL_API_KEY,
      'x-gw-ims-org-id': FIREFALL_IMSS_ORG,
      'Content-Type': 'application/json'
    })
    .post({
      dialogue: {
        question: prompt
      },
      llm_metadata: llm_metadata
    })
    .json()

  return response
}

async function main (params) {
  const accessToken = await getAccessToken(params)

  const llm_metadata = {
    llm_type: 'azure_chat_openai',
    model_name: GPT_35_TURBO,
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    n: 1
  }

  prompt = "Hello, World"
  const response = await completion(params, accessToken, prompt, llm_metadata)

  return { body: response.json() };
}

exports.main = main
