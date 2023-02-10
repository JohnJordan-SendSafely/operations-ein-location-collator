const {getSearchResults} = require('./utils/process-search-results');
const csv = require('csvtojson');
const fetch = require("make-fetch-happen");
const Console = require("console");
require('dotenv').config();


const isStatedAsForeignCountry = function (country) {
    // if value present and NOT USA => foreign
    const c = country.toUpperCase();
    return c && c !== "USA";
};


const getTrackingSheetFormat = function (serviceResult, serviceResultData, initialList) {
    // App Script Data Format for EIN Submission Tracker
    const format = {
        sellID: '',
        companyName: '',
        dba: '',
        dateOfSubmission: '',
        country: '',
        ein: '',
        einRecord: '',
        "EIN + Name Auto Validated": '',
        fullAddress: '',
        "Name Record in EIN Service": '',
        state: '',
        submitted: '',
        submissionId: '',
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
    if(serviceResultData) {
        const {address, address2, city} = serviceResultData;
        o.fullAddress = `${address}, ${address2}, ${city}`;
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
    const csvFilePath = './models/ex-customer-list - Sheet1.csv';
    const companyInitialList = await csv().fromFile(csvFilePath);

    let ein, zip, haveSearchedEIN;
    for(let i = 0, company; company = companyInitialList[i]; i+=1) {
        ein = parseInt(company.EIN, 10);
        zip = parseInt(company.ZIP, 10);
        // these fields required on Google App Script backend
        company.companyName = company['Company Name (Revenue Sheet)'];
        company.einRecord = company['Name Record in EIN Service'];
        company.einRecord.toUpperCase();
        company.fullAddress = company['Address'];
        company.issuePrevSubmission = company['Issue w/ Submission'];
        // has a previous search been done, regardless of value
        haveSearchedEIN = company.einRecord === "TRUE" || company.einRecord === "FALSE"; // Boolean -> String in .csv

        const shortName = company.companyName.length < 4; // EIN service min length

        if(!haveSearchedEIN && !isStatedAsForeignCountry(company.Country) && !shortName) {
            console.log(`need to search ${company.companyName}, ${company} ...`);
            searchResult = await getSearchResults(company.companyName);

            if(0 === searchResult.num) {
                console.log(searchResult);
                let formattedRecord = getTrackingSheetFormat(searchResult, {}, company);
                const r = await postUpdateToAppScript(formattedRecord);
                console.log('App Script response: ', r);
            }

            if(1 === searchResult.num) {
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
        }

        // If Revenue sheet Company name returns duplicate results, perform query against legal name (manual or customer entered)
        company.legalName = company['Company Name (Legal)'];
        if(haveSearchedEIN && !isStatedAsForeignCountry(company.Country) && !ein && company.legalName) {
            console.log('searching for (legal name)... ', company.legalName);
            searchResult = await getSearchResults(company.legalName);
            if(1 === searchResult.num) {
                let formattedRecord = getTrackingSheetFormat(searchResult, searchResult.data[0], company);
                // initial company record overrides all, so update these fields
                formattedRecord['Issue w/ Submission'] = '';
                formattedRecord['Issue Type'] = '';
                formattedRecord['Issue Resolved'] = 'Searched legal name to get unique EIN result';
                if(shortName) {
                    formattedRecord['Issue Resolved'] = 'Searched legal name to get an EIN result (revenue sheet name was too short)';
                }
                const r = await postUpdateToAppScript(formattedRecord);
                console.log('App Script response: ', r);
            }
        }
    }
})();

// Read/write
//searchResult = fs.readFileSync('./models/search-result-ein.json', 'UTF-8');
//fs.writeFileSync('./models/search-result-ein.json', JSON.stringify(searchResult));