const _companyStandardNames = {
    "MegaCorp" : "MegaCorp TM",
    "Monsters Incorporated": "Monsters Inc."
};
const _getCompanyStandardName = function (params) {
    return _companyStandardNames[params["company-legal-name"]];
};

const _setSubmissionValue = function(searchString) {
    const submissionTrackingSheet = SpreadsheetApp.getActive().getSheetByName("EIN Submission Tracker");
    const values = submissionTrackingSheet.getDataRange().getDisplayValues();
    const offsetArrayToSheet = 1;

    const header = values[0];
    const columnNumber_CompanyName = 2;
    const arrayIndexCompanyName = columnNumber_CompanyName - offsetArrayToSheet;
    const columnNumber_Submitted = header.indexOf("Submitted") + offsetArrayToSheet;

    // since header row is included in built-in Array methods
    let sheetRowPos;

    for(let i = offsetArrayToSheet, arrayRow; arrayRow = values[i]; i++){
        sheetRowPos = i + 1;
        if(arrayRow[arrayIndexCompanyName] === searchString) {
            console.log('found match in Tracker Sheet...', searchString, arrayRow[arrayIndexCompanyName]);
            // EIN is Column '3'
            submissionTrackingSheet.getRange(sheetRowPos,columnNumber_Submitted).setValue("Yes");
            return {found: true, row};
        }
    }

    return {found: false};

};

const test_updateTrackingSheet = function (e) {
    const _e = {
        parameter: {
            "company-legal-name": "Monsters Incorporated",
            "country-of-origin": "domestic",
            "employer-identification-number": '',
            "ein_digit_1": 1,
            "ein_digit_2": 2,
            "ein_digit_3": 3,
            "ein_digit_4": 4,
            "ein_digit_5": 5,
            "ein_digit_6": 6,
            "ein_digit_7": 7,
            "ein_digit_8": 8,
            "ein_digit_9": 9,
            "foreign_country": "None"
        }
    };
    const ev = e || _e;
    updateTrackingSheet(ev);
};

const updateTrackingSheet = function(e){
    const lock = LockService.getPublicLock();
    console.log('calling updateTrackingSheet...');
    try {
        const requestParams = e.parameter; //object
        const companyStandardName = _getCompanyStandardName(requestParams);
        const ein = _getEIN(e);
        const origin = _getCountryOfOrigin(e);
        console.log('Updating tracking sheet data: ', companyStandardName, ein, origin);

        try {
            lock.waitLock(3000);
            const sheet = SpreadsheetApp.getActive().getSheetByName("EIN Submission Tracker");

            const v = _setSubmissionValue(companyStandardName);

            // const prevSubmissionValue = sheet.getRange(1, 1, 2).getValues();
            // const prevSubmissionId = prevSubmissionValue[prevSubmissionValue.length - 1] //actual ID
            // const submissionID = parseInt(prevSubmissionId) + 1 || 1; // if first entry
            // console.log('new submission ID: ', submissionID);


            // sheet.insertRowBefore(2);
            // sheet.getRange(2,2).setValue(companyStandardName);
            // sheet.getRange(2,1).setValue(submissionID);

            // sheet.getRange(2,3).setValue(companyDBAName);
            // sheet.getRange(2,4).setValue(ein);
            // sheet.getRange(2,5).setValue(origin);
            // sheet.getRange(2,6).setValue(new Date());

            //return HtmlService.createHtmlOutput("");

        } finally {
            lock.releaseLock();
        }

    } catch (e) {
        // error email here
        console.log('Error: ', e);
    }
};