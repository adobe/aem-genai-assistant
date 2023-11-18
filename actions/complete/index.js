const {asGenericAction} = require('../GenericAction.js');
const {asAuthAction} = require('../AuthAction.js');
const {asFirefallAction} = require('../FirefallAction.js');

async function main (params) {
  const { prompt, temperature, model, firefallClient } = params;
  return await firefallClient.completion(prompt ?? 'Who are you?', temperature ?? 0.0, model ?? 'gpt-4');
}

exports.main = asAuthAction(asFirefallAction(asGenericAction(main)));
