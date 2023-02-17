const trackingSheetName = "TEST";
const submissionTrackingSheet = SpreadsheetApp.getActive().getSheetByName(trackingSheetName);
const trackingValues = submissionTrackingSheet.getDataRange().getValues();

const test_updateTrackingSheet = function (e) {
    const _e = {
        parameter: {
            "company-legal-name": "118 Group",
            "country-of-origin": "domestic",
            "company-dba-name": "",
            "parent-company": "N/A",
            "tax-exempt": "no",
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
            "foreign-company-number": "NRT-46753"
        }
    };
    const ev = e || _e;
    updateTrackingSheet(ev);
};

const _getIndexFromCompanyName = function(cName){
    let companyName = cName && cName.toLowerCase();
    const colIndexRevenueName = _getColumnIndexByName('Company Name (Revenue Sheet)', trackingValues);
    let revenueName;
    let formattedCompanyNameToFind = companyName.replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, " ").toLowerCase();
    let formattedRevenueName;
    // to avoid 'the' matching 'the acme inc.' and 'the acme corp.' etc.
    let appropriateLength;
    let formattedCompanyNameToFindFW = formattedCompanyNameToFind.split(" ")[0];
    if ('the' === formattedCompanyNameToFindFW){
        formattedCompanyNameToFindFW = formattedCompanyNameToFind.split(" ")[1];
    }
    let formattedRevenueNameFW;
    // e.g. 'Cred' v 'Credit Karma'
    let firstWordsMatch;

    for(let i = 1, row; i < trackingValues.length; i += 1) {
        row = trackingValues[i];
        revenueName = row[colIndexRevenueName - 1].toLowerCase()
        formattedRevenueName = revenueName.replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, " ");
        formattedRevenueNameFW = formattedRevenueName.split(" ")[0];
        if ('the' === formattedRevenueNameFW){
            formattedRevenueNameFW = formattedRevenueName.split(" ")[1];
        }
        appropriateLength = formattedCompanyNameToFind.length > 5 && formattedRevenueName.length > 5;
        firstWordsMatch = formattedCompanyNameToFindFW === formattedRevenueNameFW;
        if(firstWordsMatch && formattedCompanyNameToFind.includes(formattedRevenueName) || formattedRevenueName.includes(formattedCompanyNameToFind) && appropriateLength) {
            console.log('match in tracking sheet from form submission!', companyName);
            return i + 1; // row indices not zero-index
        }
    }
    return -1;
};

const updateTrackingSheet = function(e){
    console.log('calling updateTrackingSheet...');
    const requestParams = e.parameter; //object
    const companyLegalName = requestParams['company-legal-name'];
    const companyDBA = requestParams["company-dba-name"];
    const parentCompany = requestParams["parent-company"] || "N/A";
    const formEIN = _getEIN(requestParams);
    const foreignCompanyNumber = requestParams['foreign-company-number'] || "N/A";
    const country = _getCountryOfOrigin(requestParams);
    const submissionID = requestParams['submission-id'];
    const timeStamp = requestParams['time-stamp'];
    let taxExempt = false;
    if(requestParams['tax-exempt'] && "yes" === requestParams['tax-exempt'].toLowerCase()) {
        taxExempt = true;
    }
    console.log('Updating tracking sheet data: ', companyLegalName, formEIN, country, taxExempt);

    const colIndexLegalName = _getColumnIndexByName('Company Name (Legal)', trackingValues);
    const colIndexDBA = _getColumnIndexByName('D/B/A', trackingValues);
    const colIndexParentCompany = _getColumnIndexByName("Parent Company", trackingValues);
    const colIndexTaxExempt = _getColumnIndexByName('Tax-Exempt', trackingValues);
    const colIndexSubmitted = _getColumnIndexByName('Submitted Form', trackingValues);
    const colIndexSubmissionId = _getColumnIndexByName('Submission ID', trackingValues);
    const colIndexDOS = _getColumnIndexByName('Date of Submission', trackingValues);
    const colIndexForeignCompanyNumber = _getColumnIndexByName("Foreign Company Registration Number", trackingValues);
    const colIndexCountry= _getColumnIndexByName('Country', trackingValues);
    const colIndexFormEIN = _getColumnIndexByName('EIN (From Form)', trackingValues);

    const companyRowIndex = _getIndexFromCompanyName(companyLegalName);
    console.log('companyRowIndex is: ', companyRowIndex);
    //offset for header row
    if(companyRowIndex > 1) {
        console.log(trackingValues[companyRowIndex - 1]);
        submissionTrackingSheet.getRange(companyRowIndex,colIndexLegalName).setValue(companyLegalName);
        submissionTrackingSheet.getRange(companyRowIndex,colIndexDBA).setValue(companyDBA);
        submissionTrackingSheet.getRange(companyRowIndex,colIndexParentCompany).setValue(parentCompany);
        submissionTrackingSheet.getRange(companyRowIndex,colIndexTaxExempt).setValue(taxExempt);
        submissionTrackingSheet.getRange(companyRowIndex,colIndexSubmitted).setValue(true);
        submissionTrackingSheet.getRange(companyRowIndex,colIndexSubmissionId).setValue(submissionID);
        submissionTrackingSheet.getRange(companyRowIndex,colIndexDOS).setValue(timeStamp);
        submissionTrackingSheet.getRange(companyRowIndex, colIndexForeignCompanyNumber).setValue(foreignCompanyNumber);
        submissionTrackingSheet.getRange(companyRowIndex,colIndexCountry).setValue(country);
        submissionTrackingSheet.getRange(companyRowIndex,colIndexFormEIN).setValue(formEIN);
    } else {
        let subj = `Issue: Customer EIN Form Submission ID #${submissionID}`;
        let msg = `Company "${companyLegalName}" (DBA: "${companyDBA}") submitted an EIN form, but no match was found in sheet "${trackingSheetName}". 
        Submission happened on ${timeStamp}, with ID ${submissionID}`;
        _sendMailToPerson(null, subj, msg);
    }
};