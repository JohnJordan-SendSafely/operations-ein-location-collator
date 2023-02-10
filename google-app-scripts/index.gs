const SCRIPT_PROP = PropertiesService.getScriptProperties();
const SHEET_OWNER_EMAIL = SCRIPT_PROP.getProperty("SHEET_OWNER_EMAIL");
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

const doPost = function(e) {
    const ev = e || _e; // real or fake data
    const postData = ev.postData;
    const lock = LockService.getPublicLock();

    try {
        lock.waitLock(3000);
        // NOT form submission
        if(postData) {
            console.log(postData.getContentType());
            console.log(postData.contents);
            let c = JSON.parse(postData.contents);
            if(c.type === "update") {
                console.log('update recieved! ', c);
                updateHandler(c);
            }
        } else {
            // form submission
            const {submissionID, timeStamp} = handleSubmission(ev);
            ev.parameter['submission-id'] = submissionID;
            ev.parameter['time-stamp'] = timeStamp;
            updateTrackingSheet(ev);
        }
        return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
    } catch(e) {
        _sendMailToPerson(null, `Error: Customer EIN Tracking POST Request`, e);
    } finally {
        lock.releaseLock();
    }
};