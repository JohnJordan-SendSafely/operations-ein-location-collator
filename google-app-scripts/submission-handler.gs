const formSubmissionSheet = SpreadsheetApp.getActive().getSheetByName("EIN Form Submissions");
const formSubmissionSheetValues = formSubmissionSheet.getDataRange().getValues();

// Fake event data for testing.
const _eForm = {
    parameter: {
        "company-legal-name": "MegaCorp",
        "company-dba-name": "Honest Joes",
        "country-of-origin": "domestic",
        "tax-exempt": "yes",
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
    }
};

const _getEIN = function(params) {
    let ein = "";
    for(let i = 1, digit; digit = params["ein_digit_" + i]; i++ ) {
        ein += digit;
    }
    if(9 !== ein.length) {
        return "n/a";
    }
    return ein;
};

const _getTaxStatus = function(taxStatus) {
    return ("YES" === taxStatus.toUpperCase());
};

const _testHandleSubmission = function () {
    handleSubmission(_eForm);
};

const handleSubmission = function(e){
    const requestParams = e.parameter; //object
    const companyLegalName = requestParams["company-legal-name"];
    const companyDBAName = requestParams["company-dba-name"] || "n/a";
    const taxExempt = _getTaxStatus(requestParams['tax-exempt']) || "n/a";
    const ein = _getEIN(requestParams);
    const origin = _getCountryOfOrigin(requestParams);
    console.log('Submission from company: ', companyLegalName,companyDBAName, ein, origin);

    const colIndexSubmissionId = _getColumnIndexByName('Submission ID#', formSubmissionSheetValues);
    const colIndexLegalName = _getColumnIndexByName('Legal Name', formSubmissionSheetValues);
    const colIndexDBA = _getColumnIndexByName('D/B/A Name', formSubmissionSheetValues);
    const colIndexTaxExempt = _getColumnIndexByName('Tax-Exempt', formSubmissionSheetValues);
    const colIndexEIN = _getColumnIndexByName('Employer Identification Number', formSubmissionSheetValues);
    const colIndexCountry = _getColumnIndexByName('Country of Origin', formSubmissionSheetValues);
    const colIndexTimeStamp = _getColumnIndexByName('Timestamp', formSubmissionSheetValues);

    const prevSubmissionValue = formSubmissionSheet.getRange(1, 1, 2).getValues();
    const prevSubmissionId = prevSubmissionValue[prevSubmissionValue.length - 1] //actual ID
    const submissionID = parseInt(prevSubmissionId) + 1 || 1; // if first entry
    console.log('new submission ID: ', submissionID);

    //New submissions will be stored in the sheet, starting with the most recent entry first
    formSubmissionSheet.insertRowBefore(2);
    formSubmissionSheet.getRange(2,colIndexSubmissionId).setValue(submissionID);
    formSubmissionSheet.getRange(2,colIndexLegalName).setValue(companyLegalName);
    formSubmissionSheet.getRange(2,colIndexDBA).setValue(companyDBAName);
    formSubmissionSheet.getRange(2,colIndexTaxExempt).setValue(taxExempt);
    formSubmissionSheet.getRange(2,colIndexEIN).setValue(ein);
    formSubmissionSheet.getRange(2,colIndexCountry).setValue(origin);
    const timeStamp = new Date();
    formSubmissionSheet.getRange(2,colIndexTimeStamp).setValue(timeStamp);
    return {submissionID, timeStamp};
};