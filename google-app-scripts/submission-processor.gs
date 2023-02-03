const EIN_API_KEY = SCRIPT_PROP.getProperty("EIN_API_KEY");
// Need STATIC IP for this to work (whitelisted on case-by-case basis)

const _getEINFromService = async function(requestParams) {
    const companyName = "Amazon Com";
    const data = {
        "Company": companyName
    };
    const options = {
        'headers': {
            "KEY": EIN_API_KEY
        },
        'method' : 'POST',
        'contentType': 'application/json',
        'payload' : JSON.stringify(data)
    };
    console.log('fetching data from EIN service...');
    const r = await UrlFetchApp.fetch('https://api.einsearch.com/api/Fein/SearchByName', options);
    const rData = JSON.parse(r.getContentText('UTF-8'));
    console.log('response code is: ', r.getResponseCode());
    if(200 === r.getResponseCode()) {
        console.log('response received from EIN service...');
        if("error" === rData.status.toLowerCase()) {
            const errorMsg = rData.message;
            console.log('Error in EIN service received response: ', errorMsg);
        }
    } else {
        const errorMsg = rData.message;
        console.log('Error connecting to EIN service: ', errorMsg)
    }
};

var processSubmission = function(e) {
    const requestParams = e.parameter;
};