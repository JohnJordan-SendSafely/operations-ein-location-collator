const {getSearchResults} = require('./utils/process-search-results');
const csvFilePath='./models/ex-customer-list - Sheet1.csv';
const csv = require('csvtojson');
const fetch = require("make-fetch-happen");
const fs = require('fs');
require('dotenv').config();


/**
 * Get JSON objects from CSV
 */

// (async function (){
//     try {
//         const jsonArray = await csv().fromFile(csvFilePath);
//         console.log(jsonArray[0]);
//     } catch(e) {
//         console.log(e)
//     }
// })();



const c = {
    '2018': '',
    '2019': 'x',
    '2020': 'x',
    '2021': 'x',
    '2022': '',
    sellID: '245603276',
    companyName: 'Meepo Board',
    country: "United States",
    'In Prev Sheet?': '0',
    Email: '#REF!',
    'Additional Emails': '#N/A',
    field11: '#N/A',
    field12: '#N/A'
};


const c2 = {
    '2018': '',
    '2019': 'x',
    '2020': 'x',
    '2021': 'x',
    '2022': '',
    sellID: '233349462',
    companyName: 'MBP Group',
    'In Prev Sheet?': '0',
    Email: '#REF!',
    'Additional Emails': '#N/A',
    field11: '#N/A',
    field12: '#N/A'
};



const getTrackingSheetFormat = function (serviceResult, serviceResultData, initialList) {
    // Some of these properties will only appear in form submissions, e.g. D/B/A name
    const format = {
        sellID: '',
        companyName: '',
        dba: '',
        submitted: '',
        submissionId: '',
        dateOfSubmission: '',
        country: '',
        ein: '',
        "EIN + Name Auto Validated": '',
        state: '',
        zipCode: '',
        "State + ZIP Auto Validated": '',
        "Issue w/ Submission": false,
        "Issue Type": '',
        "Issue Resolved": ''
    };
    if(serviceResult.issue) {
        format["Issue w/ Submission"] = true;
        format['Issue Type'] = serviceResult.issue;
    }

    // 1. serviceResult: zipValidated, issue
    // initialList: sellId and companyName, dba, submtited, submissionId, data of submission, country, ein (maybe)

    // 3. serviceResultData: zipCode, State
    // Want revenue sheet name to be source of TRUTH! (=> initial result is not over-written
    return {...format, ...serviceResult, ...serviceResultData, ...initialList};
};

const postUpdateToAppScript = async function (formattedRecord) {
    console.log('formattedRecord is: ', formattedRecord);
    const postToSheet = {
        type: 'update',
        formattedRecord
    };
    const updateSheet = await fetch('https://script.google.com/macros/s/AKfycbwC6vnoawSU_jMhzb0YCd-xXeYMQaEPAeBKo5oGQYPJxGX3nriENjTPNDudo5N9bYRq/exec',
        {
            method:'post',
            body: JSON.stringify(postToSheet)
        });
    return  await updateSheet.json();
};

// 1 load from CSV, a JSON arry
// 2 For each company, look up name
(async function (){

    //let companyInitialist = await csv().fromFile(csvFilePath);
    let searchResult;
    // Using our records as source of Truth
    let companyInitialList = [c, c2];

    for(let i = 0, company; company = companyInitialList[i]; i+=1) {
        searchResult = await getSearchResults(company.companyName);

        if(0 === searchResult.num) {
            console.log(searchResult);
            let formattedRecord = getTrackingSheetFormat(searchResult, {}, company);
            const r = await postUpdateToAppScript(formattedRecord);
            console.log('App Script response: ', r);
        }

        if(1 === searchResult.num && undefined === searchResult.issue) {
            let formattedRecord = getTrackingSheetFormat(searchResult, searchResult.data[0], company);
            const r = await postUpdateToAppScript(formattedRecord);
            console.log('App Script response: ', r);

        }
    }
})();

// Read/write
//searchResult = fs.readFileSync('./models/search-result-ein.json', 'UTF-8');
//fs.writeFileSync('./models/search-result-ein.json', JSON.stringify(searchResult));