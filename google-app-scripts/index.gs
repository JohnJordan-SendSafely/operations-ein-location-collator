const _e = {
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

const doPost = function(e){
    const ev = e || _e; // real or fake data
    const postData = ev.postData;
    if(postData) {
        console.log(postData.getContentType());
        console.log(postData.contents);
        let c = JSON.parse(postData.contents);
        if(c.type === "update") {
            console.log('update recieved! ', c);
            updateHandler(c);
        }
    } else {
        // handleSubmission(ev);
        // updateTrackingSheet(ev);
    }
    return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
};