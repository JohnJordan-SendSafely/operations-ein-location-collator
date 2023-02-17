const _getColumnIndexByName = function(colName, sheetValues) {
    const header = sheetValues[0];
    for(let i = 0, name; i < header.length; i+= 1) {
        name = header[i];
        if(name === colName) {
            return i + 1; // array zero indexed
        }
    }
    return -1;
};

const _getCountryOfOrigin = function (parameters) {
    const countryOfOrigin = parameters['country-of-origin'].toLowerCase();
    if("domestic" === countryOfOrigin) return "USA";
    if("foreign" === countryOfOrigin) return parameters['foreign-country'];
    return "error with form data";
};

const _getForeignCompanyNumber = function(regNumber = "") {
    return regNumber && regNumber.toUpperCase();
};

const _findRowMatch = function(ev){
    const idToFind = ev.sellID;
    const nameToFind = ev.companyName.toLowerCase();
    let currID, currName;
    // ignore header row
    for(let rowIndex = 1, record; rowIndex < sheetValuesSubT.length; rowIndex +=1){
        record = sheetValuesSubT[rowIndex]
        currID = parseInt(record[0], 10);
        if(currID && currID === idToFind) {
            //console.log('row match on SellID: ', idToFind, rowIndex);
            return rowIndex + 1; // sheet rows not zero-indexed
        }
        currName = record[1];
        if(currName.toLowerCase() === nameToFind) {
            //console.log('row match on name: ', nameToFind, rowIndex);
            return rowIndex + 1;  // sheet rows not zero-indexed
        }
    }
};

const _isUSACompany = function(val1, val2) {
    return val1 === "USA" || val1 === "US" || val2 === "USA" || val2 === "US";
};

const _sendMailToPerson = function(person = "", subject, message) {
    const recip = person || SHEET_OWNER_EMAIL;
    const sub = subject || `Issue with EIN Tracking Sheet`;
    const msg = message || 'No details were provided. ';
    GmailApp.sendEmail(recip, sub, msg);
};