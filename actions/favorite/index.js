/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const { asGenericAction } = require('../GenericAction.js');
const { asAuthAction } = require('../AuthAction.js');

const { AppError } = require('../../web-src/src/helpers/ErrorMapper.js');

const wretch = require('wretch');

async function main(params) {
    const { data } = params;
    try {
        // data is an array of objects,
        // iterate over each object and make a POST reuest to the API endpoing
        // https://hook.app.workfrontfusion.com/cytq82vrakjn5p8xtaashn6gm2qc3jif
        // with the data object as the body
        // return the response from the API
        results = []

        console.log('saving new variations ...');

        for (const variant of data) {
            let r = await wretch(`https://hook.app.workfrontfusion.com/cytq82vrakjn5p8xtaashn6gm2qc3jif`)
                .headers({
                    'Content-Type': 'application/json',
                })
                .post({
                    data: variant
                })
                .json();
            results.push(r);
        }
        
        return {
            statusCode: 200,
            body: {
                message: 'Favorites updated in API',
                results: results
            }
        };
    } catch (error) {
        throw new AppError(error, 'FUSION');
    }
}

//exports.main = asAuthAction(asGenericAction(main));
exports.main = asGenericAction(main);