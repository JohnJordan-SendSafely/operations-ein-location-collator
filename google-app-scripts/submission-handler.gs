const SCRIPT_PROP = PropertiesService.getScriptProperties();
// Fake event data for testing.
const _eForm = {
    parameter: {
        "company-legal-name": "MegaCorp",
        "company-dba-name": "Honest Joes",
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
        "foreign_country": ""
    }
};

const _getCountryOfOrigin = function (e) {
    const params = e.parameter;
    const o = params['country-of-origin'];
    const foreignCountry = params['foreign-country'];
    if("domestic" === o) return "United States";
    if("foreign" === o) return  foreignCountry;
    return "error with form data";
};

const _getEIN = function(e) {
    const params = e.parameter;
    let ein = "";
    for(let i = 1, digit; digit = params["ein_digit_" + i]; i++ ) {
        ein += digit;
    }
    if(9 !== ein.length) {
        return "n/a";
    }
    return ein;
};

const _testHandleSubmission = function () {
    handleSubmission(_eForm);
};

const handleSubmission = function(e){
    const lock = LockService.getPublicLock();
    try {
        const requestParams = e.parameter; //object
        const companyLegalName = requestParams["company-legal-name"];
        const companyDBAName = requestParams["company-dba-name"] || "n/a";
        const ein = _getEIN(e);
        const origin = _getCountryOfOrigin(e);
        console.log('Submission from company: ', companyLegalName,companyDBAName, ein, origin);

        try {
            lock.waitLock(3000);
            const sheet = SpreadsheetApp.getActive().getSheetByName("EIN Form Submissions");

            const prevSubmissionValue = sheet.getRange(1, 1, 2).getValues();
            const prevSubmissionId = prevSubmissionValue[prevSubmissionValue.length - 1] //actual ID
            const submissionID = parseInt(prevSubmissionId) + 1 || 1; // if first entry
            console.log('new submission ID: ', submissionID);

            //New submissions will be stored in the sheet, starting with the most recent entry first
            sheet.insertRowBefore(2);
            sheet.getRange(2,1).setValue(submissionID);
            sheet.getRange(2,2).setValue(companyLegalName);
            sheet.getRange(2,3).setValue(companyDBAName);
            sheet.getRange(2,4).setValue(ein);
            sheet.getRange(2,5).setValue(origin);
            sheet.getRange(2,6).setValue(new Date()); // Timestamp

        } finally {
            lock.releaseLock();
        }

    } catch (e) {
        // error email here
        console.error(e);
    }
};