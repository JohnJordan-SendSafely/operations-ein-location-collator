const {getSearchResults} = require('./utils/process-search-results');
const csv = require('csvtojson');
const fetch = require("make-fetch-happen");
const fs = require('fs');
require('dotenv').config();




const getTrackingSheetFormat = function (serviceResult, serviceResultData, initialList) {
    // App Script Data Format for EIN Submission Tracker
    const format = {
        sellID: '',
        companyName: '',
        dba: '',
        submitted: '',
        submissionId: '',
        dateOfSubmission: '',
        country: '',
        ein: '',
        einRecord: '',
        "Name Record in EIN Service": '',
        "EIN + Name Auto Validated": '',
        state: '',
        zipCode: '',
        "State + ZIP Auto Validated": '',
        "Issue w/ Submission": false,
        "Issue Type": '',
        "Issue Resolved": ''
    };

    // Want revenue sheet name to be source of truth (=> initialList is final)
    const o = {...format, ...serviceResult, ...serviceResultData, ...initialList};
    if(serviceResult.issue) {
        o["Issue w/ Submission"] = true;
        o['Issue Type'] = serviceResult.issue;
    }
    o.einRecord = serviceResult.einRecord;
    return o;
};

const postUpdateToAppScript = async function (formattedRecord) {
    console.log('formattedRecord being POSTED is: ', formattedRecord);
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


(async function (){

    let searchResult;
    // Using our records as source of Truth
    // let companyInitialList = [c, c2];
    // const csvFilePath='./models/ex-customer-list - Sheet1.csv';
    const csvFilePath = './models/operations-ein-location-collator - EIN Submission Tracker.csv';
    const companyInitialList = await csv().fromFile(csvFilePath);

    let ein, zip, haveSearchedEIN;
    for(let i = 0, company; company = companyInitialList[i]; i+=1) {
        ein = parseInt(company.ein, 10);
        zip = parseInt(company.ZIP, 10);
        // these fields required on Google App Script backend
        company.companyName = company['Company Name (Standardized)'];
        company.einRecord = company['Name Record in EIN Service'];
        company.einRecord.toUpperCase();
        haveSearchedEIN = company.einRecord === "TRUE" || company.einRecord === "FALSE"; // Boolean -> String in .csv
        if(!haveSearchedEIN) {
            console.log('need to search...');
            searchResult = await getSearchResults(company.companyName);
            //console.log('searchResult: ', searchResult);

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

            if(2 <= searchResult.num) {
                console.log('more than one result...');
                let formattedRecord = getTrackingSheetFormat(searchResult, {}, company);
                const r = await postUpdateToAppScript(formattedRecord);
                console.log('App Script response: ', r);
            }
        } else {
            console.log('have searched already...')
        }
    }
})();

// Read/write
//searchResult = fs.readFileSync('./models/search-result-ein.json', 'UTF-8');
//fs.writeFileSync('./models/search-result-ein.json', JSON.stringify(searchResult));