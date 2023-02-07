const SHEET_OWNER_EMAIL = SCRIPT_PROP.getProperty("SHEET_OWNER_EMAIL");

const sheetSubT = SpreadsheetApp.getActive().getSheetByName("EIN Submission Tracker");
const sheetValuesSubT = sheetSubT.getDataRange().getValues();

/**
 * @param rowMatchIndex [number] row index of matched record in sheet
 * @param r [object] record to update
 */
const _setDomesticValues = function(rowMatchIndex, r) {
    sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Country')).setValue("United States");
    sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('EIN')).setValue(r.ein);
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
    sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Address')).setValue(r.fullAddress);
};

const updateHandler = function (postedUpdate) {
    console.log('handling update...');
    const _e = {
        num: 0,
        data: [],
        einRecord: false,
        issue: 'No results returned.',
        sellID: '245603276',
        companyName: 'Meepo Board',
    };
    const recordToUpdate = postedUpdate && postedUpdate.formattedRecord || _e;

    const rowMatchIndex = _findRowMatch(recordToUpdate);
    if(rowMatchIndex && typeof rowMatchIndex === "number") {
        console.log('match found...', rowMatchIndex);
        let ein = recordToUpdate.ein;
        let einRecord = recordToUpdate.einRecord;
        if(einRecord && ein && typeof parseInt(ein, 10) === "number") {
            _setDomesticValues(rowMatchIndex, recordToUpdate);
        } else {
            if(recordToUpdate.country && "United States" === recordToUpdate.country) {
                GmailApp.sendEmail(SHEET_OWNER_EMAIL,
                    `Issue with Sheet Tracker Update: ${recordToUpdate.companyName}`,
                    `No EIN for this company (Sell ID: ${recordToUpdate.sellID}), but may be US company (As per 'EIN Submission Tracker' sheet)`
                );
                recordToUpdate['Issue Type'] += " (May be a US company).";
            }
        }
        sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Name Record in EIN Service')).setValue(einRecord);
        sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Issue w/ Submission')).setValue(recordToUpdate['Issue w/ Submission']);
        sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Issue Type')).setValue(recordToUpdate['Issue Type']);
        sheetSubT.getRange(rowMatchIndex, _getColumnIndexByName('Issue Resolved')).setValue(recordToUpdate['Issue Resolved']);
        // end of ROW MATCH block
    } else {
        console.log(`No record found in Sheet Tracker for company ('${recordToUpdate.companyName}')`);
        GmailApp.sendEmail(SHEET_OWNER_EMAIL, `Issue with Sheet Tracker Update: ${recordToUpdate.companyName}`,
            `No match for this name or sell ID (${recordToUpdate.sellID}) found in the tracking sheet 'EIN Submission Tracker'`);
    }

};