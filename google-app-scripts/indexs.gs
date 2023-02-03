const doPost = function(e){
    const ev = e || _e; // real or fake data
    handleSubmission(ev);
    updateTrackingSheet(ev);
    return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
};