const {asGenericAction} = require('../GenericAction.js');
const {asAuthAction} = require('../AuthAction.js');
const {asFirefallAction} = require('../FirefallAction.js');

async function main (params) {
  const { queryId, sentiment, firefallClient } = params;
  return await firefallClient.feedback(queryId, sentiment);
}

exports.main = asAuthAction(asFirefallAction(asGenericAction(main)));
