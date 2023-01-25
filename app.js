const SCRIPT_PROP = PropertiesService.getScriptProperties();
const _setup = function() {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty("key", doc.getId());
    const sheet = doc.getSheets()[0];
    sheet.setName("EIN Form Submissions");
    sheet.getRange(1,1).setValue("Submission ID#");
    sheet.getRange(1,2).setValue("Company Name");
    sheet.getRange(1,3).setValue("Employer Identification Number");
    sheet.getRange(1,4).setValue("Timestamp");
    console.log("setup complete");
    //if (SCRIPT_PROP.getProperty("sendsafely_validation_key") == undefined) { SCRIPT_PROP.setProperty("sendsafely_validation_key", "") };
};
const _getEIN = function(e) {
    const params = e.parameter;
    let ein = "";
    for(let i = 1, digit; digit = params["ein_digit_" + i]; i++ ) {
        ein += digit;
    }
    return parseInt(ein);
}
const doPost = function(e){
    return handleResponse(e);
};
const handleResponse = function(e){
    const lock = LockService.getPublicLock();
    try {
        const requestParams = e.parameter; //object
        const companyName = requestParams["company-name"];
        const ein = _getEIN(e);
        console.log('Submission from company: ', companyName, ein);

        try {
            lock.waitLock(3000);
            const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

            const prevSubmissionValue = sheet.getRange(1, 1, 2).getValues();
            const prevSubmissionId = prevSubmissionValue[prevSubmissionValue.length - 1] //actual ID
            const submissionID = parseInt(prevSubmissionId) + 1 || 1; // if first entry
            console.log('new submission ID: ', submissionID);

            //New submissions will be stored in the sheet, starting with the most recent entry first
            sheet.insertRowBefore(2);
            sheet.getRange(2,1).setValue(submissionID);
            sheet.getRange(2,2).setValue(companyName);
            sheet.getRange(2,3).setValue(ein);
            sheet.getRange(2,4).setValue(new Date()); // Timestamp

            return HtmlService.createHtmlOutput("<h1>Submission received</h1><p>Thank you</p>");

        } finally {
            lock.releaseLock();
        }

    } catch (e) {
        // error email here
    }
};

const test_handleResponse = function () {
    const _e = {
        parameter: {
            "company-name": "MegaCorp",
            "employer-identification-number": 92344556,
            "ein_digit_1": 1,
            "ein_digit_2": 2,
            "ein_digit_3": 3,
            "ein_digit_4": 4,
            "ein_digit_5": 5,
            "ein_digit_6": 6,
            "ein_digit_7": 7,
            "ein_digit_8": 8,
            "ein_digit_9": 9,
        }
    };
    handleResponse(_e);
}