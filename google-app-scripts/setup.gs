const _setup = function() {
    const doc = SpreadsheetApp.getActive().getSheetByName("EIN Form Submissions");
    SCRIPT_PROP.setProperty("key", doc.getId());
    const sheet = doc.getSheets()[0];
    sheet.setName("EIN Form Submissions");
    sheet.getRange(1,1).setValue("Submission ID#");
    sheet.getRange(1,2).setValue("Legal Name");
    sheet.getRange(1,3).setValue("D/B/A Name");
    sheet.getRange(1,4).setValue("Employer Identification Number");
    sheet.getRange(1,5).setValue("Country of Origin");
    sheet.getRange(1,6).setValue("Timestamp");
    // ToDO: setup of tracker form
    console.log("setup complete");
    //if (SCRIPT_PROP.getProperty("sendsafely_validation_key") == undefined) { SCRIPT_PROP.setProperty("sendsafely_validation_key", "") };
};