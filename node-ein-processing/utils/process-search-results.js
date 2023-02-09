const {companyLookup} = require("./company-name-search");
const validateZIP = require('./validate-state-zip');

const getSearchResults = async function(companyName) {
    const issues = {
      0: 'No results returned.',
      1: 'State and ZIP validation failed.',
      2: 'More than one company name result.',
        error: 'Failed to connect to service.'
    };
    let response = {
        num: 0,
        data: [],
        einRecord: ''
    };
    try {
        const apiResponse = await companyLookup(companyName);
        const responseStatus = apiResponse.status; //'Success' or 'Error'
        const companyNameSearchResults = apiResponse.data;

        if('success' !== responseStatus.toLowerCase()) {
            console.log('Error in connecting to EIN service.');
            response.issue = issues.error;
            return response;
        }


        if(!companyNameSearchResults.length) {
            // no results for that company name
            console.log(`No results available for this company (${companyName})`);
            response.issue = issues['0'];
            response.einRecord = false;
            return response;
        }

        console.log('Number of raw matches returned (with possible duplicates): ', companyNameSearchResults.length);
        let deDupedEINs = companyNameSearchResults.filter((rec, currIndex, self) => {
            // Two companies, same EIN in Edison (NE and NJ) => check state code as well
            const firstIndexPos = self.findIndex(t => {
                return t.ein === rec.ein && t.state === rec.state;
            });
            // not a duplicate if first occurrence is same as current index position
            return currIndex === firstIndexPos;
        });

        console.log('Number of de-duped matches returned: ', deDupedEINs.length);
        if(deDupedEINs.length === 1) {
            console.log('Unique match found...');

            // one result, proceed to TIN validation
            const testCase = companyNameSearchResults[0];
            const fiveDigitZIP = testCase.zipCode.slice(0,5)
            console.log(`Validating State and ZIP code...`);
            if(validateZIP.getState(fiveDigitZIP) !== testCase.state) {
                console.log('Failure: Validation of State and ZIP.');
                response.issue = issues['1'];
            } else {
                response.zipValidated = true;
                console.log('Success: Validation of State and ZIP.');
            }
            response.num = 1;
            response.data.push(testCase);
            response.einRecord = true;
            return response;
        }

        if(deDupedEINs.length > 1) {
            // duplicates
            console.log(`Multiple responses returned for this company (${companyName}): `);
            response.num = deDupedEINs.length;
            // clear this out, since more than one company result
            response.data = [];
            response.einRecord = true;
            response.issue = issues['2'];
            return response;
        }
    } catch(e) {
        console.error(e);
    }
};

module.exports.getSearchResults = getSearchResults;