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

async function main (params) {
  const accessToken = await getAccessToken(params)
  return { body: 'Hello, World' };
}

exports.main = main
