const SHEET_OWNER_EMAIL = SCRIPT_PROP.getProperty("SHEET_OWNER_EMAIL");
const _eUpdate = {
    sellID: '233349462',
    companyName: 'MBP GROUP INC',
    'In Prev Sheet?': '0',
    Email: '#REF!',
    'Additional Emails': '#N/A',
    field11: '#N/A',
    field12: '#N/A',
    num: 1,
    data: [ [Object] ],
    zipValidated: true,
    companyId: '19800858',
    ein: '030548550',
    address: '2297 LAKE AVE SE UNIT A7',
    address2: '',
    city: 'LARGO',
    state: 'FL',
    zipCode: '337713748',
    telephone: '7275858650',
    fax: '',
    website: null,
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    sic: '8999',
    totalEmployees: '000000002',
    salesRevenue: null,
    headQuarter: '',
    ncoa: null,
    dateAcquired: '2016 or older',
    ncoaUpdateDate: '2022-04'
};

const sheetSubT = SpreadsheetApp.getActive().getSheetByName("EIN Submission Tracker");
const sheetValuesSubT = sheetSubT.getDataRange().getValues();

const _getColumnIndexByName = function(colName) {
    const header = sheetValuesSubT[0];
    for(let i = 0, name; name = header[i]; i+= 1) {
        if(name === colName) {
            return i + 1; // array zero indexed
        }
    }
    return -1;
};
/**
 * @param rowMatchIndex [number] row index of matched record in sheet
 * @param r [object] record to update
 */
const _setDomesticValues = function(rowMatchIndex, r) {
    sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Country')).setValue("United States");
    sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('EIN')).setValue(r.ein);
    sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Record in EIN Service')).setValue(r.einRecord);
    if(2 !== r.state.length) {
        console.log('State code is not 2-code format for ', r.companyName);
    }
    sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('State')).setValue(r.state);

    let zip = parseInt(r.zipCode, 10);
    if(!(zip && 'number' === typeof zip)) {
        console.log('ZIP code is not in expected format for ', r.companyName);
    }
    sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('ZIP')).setValue(r.zipCode);
    sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('State + ZIP Auto Validated')).setValue(r.zipValidated);
};

const findRowMatch = function(ev){
    const idToFind = ev.sellID;
    const nameToFind = ev.companyName.toLowerCase();
    let currID, currName;
    // ignore header row
    for(let rowIndex = 1, record; record = sheetValuesSubT[rowIndex]; rowIndex +=1){
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

const updateHandler = function (postedUpdate) {
    console.log('handling update...');
    /**
     * test data
     */
    const _e = {
        ein: "030548550",
        companyName: 'MBP Group',
        einRecord: true,
        "Issue w/ Submission": false,
        "Issue type": '',
        sellID: 233349462,
        state: 'FL',
        zipCode: '337713748',
        zipValidated: true
    }
    const recordToUpdate = postedUpdate && postedUpdate.formattedRecord || _e;
    // end
    const rowMatchIndex = findRowMatch(recordToUpdate);

    if(rowMatchIndex && typeof rowMatchIndex === "number") {
        let ein = recordToUpdate.ein;
        if(ein && typeof parseInt(ein, 10) === "number") {
            _setDomesticValues(rowMatchIndex, recordToUpdate);
        } else {
            //TODO: notify sheet owner that no EIN found for this company (unless foreign country)

        }

        sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Issue w/ Submission')).setValue(recordToUpdate['Issue w/ Submission']);
        sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Issue Type')).setValue(recordToUpdate['Issue Type']);
        sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Issue Resolved')).setValue(recordToUpdate['Issue Resolved']);
        // end of ROW MATCH IF
    } else {
        console.warn(`No record found in Sheet Tracker for company ('${recordToUpdate.companyName}')`);
        GmailApp.sendEmail(SHEET_OWNER_EMAIL, `Issue with Sheet Tracker Update: ${recordToUpdate.companyName}`,
            `No match for this name or sell ID (${recordToUpdate.sellID}) found in the tracking sheet 'EIN Submission Tracker'`);
    }

};