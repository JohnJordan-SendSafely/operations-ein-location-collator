var SCRIPT_PROP =  PropertiesService.getScriptProperties();
function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty("key", doc.getId());
    var sheet = doc.getSheets()[0];
    sheet.setName("EIN Form Submissions");
    sheet.getRange(1,1).setValue("Submission ID#");
    sheet.getRange(1,2).setValue("Company Name");
    sheet.getRange(1,3).setValue("Employer Identification Number");
    sheet.getRange(1,4).setValue("Timestamp");
    console.log("setup complete");
    //if (SCRIPT_PROP.getProperty("sendsafely_validation_key") == undefined) { SCRIPT_PROP.setProperty("sendsafely_validation_key", "") };
}