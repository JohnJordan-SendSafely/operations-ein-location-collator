const _getRowWithValue = function(searchString, columnNumber = 1) {
    const values = SpreadsheetApp.getActiveSheet().getDataRange().getDisplayValues();
    // start at 1, to ignore header
    for(let i = 1, row; row = values[i]; i++){
        if(row[columnNumber - 1] === searchString) {
            // EIN is Column '3'
            console.log(i, row);
            // getRange starts at top left (0,0) including first row => need offset; EIN at column '3'
            SpreadsheetApp.getActiveSheet().getRange(i+1,3).setValue("Yes");
            return {found: true, row};
        }
    }

    return {found: false};

};

const test_updateTrackingSheet = function (e) {
    const _e = {
        parameter: {
            "company-standard-name": "Monsters Inc.",
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
// Can only be declared once in entire App Script project
// function doPost(e) {
//   updateTrackingSheet(e);
// };

var updateTrackingSheet = function(e){
    const lock = LockService.getPublicLock();
    try {
        const requestParams = e.parameter; //object
        const companyStandardName = requestParams["company-standard-name"];
        const ein = _getEIN(e);
        const origin = _getCountryOfOrigin(e);
        console.log('Updating tracking sheet data: ', companyStandardName, ein, origin);

        try {
            lock.waitLock(3000);
            const sheet = SpreadsheetApp.getActive().getSheetByName("EIN Submission Tracker");

            const v = _getRowWithValue(companyStandardName);
            const notV = _getRowWithValue("Foo");
            //console.log('Value found? ', v);
            //console.log('Value found for not V? ', notV);

            console.log(sheet.getDataRange().getValues()[0][2]);
            if(v.found) {

            }

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
    }
};