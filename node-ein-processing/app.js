const {companyLookup} = require("./company-name-search");
const csvFilePath='./ex-customer-list - Sheet1.csv';
const csv=require('csvtojson');
const validateZIP = require("./validate-state-zip");
require('dotenv').config();


/**
 * Get JSON objects from CSV
 */

// (async function (){
//     try {
//         const jsonArray = await csv().fromFile(csvFilePath);
//         console.log(jsonArray[0]);
//     } catch(e) {
//         console.log(e)
//     }
// })();

const c = {
    '2018': '',
    '2019': 'x',
    '2020': 'x',
    '2021': 'x',
    '2022': '',
    sellID: '245603276',
    companyName: 'Meepo Board',
    'In Prev Sheet?': '0',
    Email: '#REF!',
    'Additional Emails': '#N/A',
    field11: '#N/A',
    field12: '#N/A'
};

(async function(){
    try {
        //const apiResponse = await companyLookup(c.companyName);
        const apiResponse = await companyLookup('MBP Group');
        const responseStatus = apiResponse.status; //'Success' or 'Error'
        const companyNameSearchResults = apiResponse.data;

        if('success' !== responseStatus.toLowerCase()) {
            console.log('Error in connecting to EIN service');
            return;
        }


        if(!companyNameSearchResults.length) {
            // no results for that company name
            // return response to client, indicating optimistic update (since Name Search is broken, and can validate TIN-Name match)
            /*
                can validate customer submission EIN against name manually since IRS database available realtime
             */
            console.log(`no results available for this company (${c.companyName})`);
        }

        let deDupedEINs = companyNameSearchResults.filter((rec, currIndex, self) => {
            const firstIndexPos = self.findIndex(t => t.ein === rec.ein);
            // not a duplicate if first occurrence is same as current index position
            return currIndex === firstIndexPos;
        });

        console.log('Number of matches returned: ', deDupedEINs.length);

        if(deDupedEINs.length === 1) {
            console.log('One result found...', companyNameSearchResults[0])
            // one result, proceed to TIN validation
            const testCase = companyNameSearchResults[0];
            const fiveDigitZIP = testCase.zipCode.slice(0,5)
            console.log(testCase.state, fiveDigitZIP, validateZIP.getState(fiveDigitZIP) === testCase.state);

            if(validateZIP.getState(fiveDigitZIP) !== testCase.state) {
                //TODO: email that ZIP code/State validation has failed
            } else {
                console.log('Validation of Zip confirmed...')
            }
        }

        if(deDupedEINs.length > 1) {
            // duplicates
            // return response to client, indicating optimistic update (since Name Search is broken, and can validate TIN-Name match)
            // will require manual parsing of names to find

            console.log('deDupedEINs: ', deDupedEINs);
        }
    } catch(e) {
        console.error(e);
    }
})();