const fs = require("fs");
const validate = require("../node-ein-processing/validate-state-zip");
const raw = fs.readFileSync('ein-api-results.json', 'utf-8');
// const companyNameSearchResults = JSON.parse(raw).data;
//
// let deDupedEINs = companyNameSearchResults.filter((rec, currIndex, self) => {
//     const firstIndexPos = self.findIndex(t => t.ein === rec.ein);
//     // not a duplicate if first occurrence is same as current index position
//     return currIndex === firstIndexPos;
// });
//
// if(!deDupedEINs.length) {
//     // no results for that company name
//     // return response to client, indicating optimistic update (since Name Search is broken, and can validate TIN-Name match)
//     /*
//         can validate customer submission EIN against name manually since IRS database available realtime
//      */
// }
// if(deDupedEINs.length === 1) {
//     // one result, proceed to TIN validation
//     const testCase = deDupedEINs[0];
//     const fiveDigitZIP = testCase.zipCode.slice(0,5)
//     console.log(testCase.state, fiveDigitZIP, validate.getState(fiveDigitZIP) === testCase.state);
//
//     if(validate.getState(fiveDigitZIP) !== testCase.state) {
//         //TODO: email that ZIP code/State validation has failed
//     }
// }
//
// if(deDupedEINs.length > 1) {
//     // duplicates
//     // return response to client, indicating optimistic update (since Name Search is broken, and can validate TIN-Name match)
//     // will require manual parsing of names to find
// }