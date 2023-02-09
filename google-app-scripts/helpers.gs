const _getColumnIndexByName = function(colName, sheetValues) {
    const header = sheetValues[0];
    for(let i = 0, name; i < header.length; i+= 1) {
        name = header[i];
        if(name === colName) {
            return i + 1; // array zero indexed
        }
    }
    return -1;
};

const _findRowMatch = function(ev){
    const idToFind = ev.sellID;
    const nameToFind = ev.companyName.toLowerCase();
    let currID, currName;
    // ignore header row
    for(let rowIndex = 1, record; rowIndex < sheetValuesSubT.length; rowIndex +=1){
        record = sheetValuesSubT[rowIndex]
        currID = parseInt(record[0], 10);
        if(currID && currID === idToFind) {
            //console.log('row match on SellID: ', idToFind, rowIndex);
            return rowIndex + 1; // sheet rows not zero-indexed
        }
        currName = record[1];
        if(currName.toLowerCase() === nameToFind) {
            //console.log('row match on name: ', nameToFind, rowIndex);
            return rowIndex + 1;  // sheet rows not zero-indexed
        }
    }
};

const _isUSACompany = function(val1, val2) {
    return val1 === "USA" || val1 === "US" || val2 === "USA" || val2 === "US";
};

const _reconcileCompanyNames = function() {
    const sheetXero= SpreadsheetApp.getActive().getSheetByName("Xero List");
    const sheetValuesXero = sheetXero.getDataRange().getValues();

    const sheetSubT = SpreadsheetApp.getActive().getSheetByName("EIN Submission Tracker");
    const sheetValuesSubT = sheetSubT.getDataRange().getValues();

    const colIndexXeroCompanyName = _getColumnIndexByName('*ContactName', sheetValuesXero);

    const xeroFirstNameWords = {};
    let companyXeroName;
    let companyFirstWord;
    let formattedCompanyName;
    let splitName;
    let fullName; // for duplicates

    for(let i = 1, row; i < sheetValuesXero.length; i += 1) {
        row = sheetValuesXero[i];
        companyXeroName = row[colIndexXeroCompanyName - 1].toLowerCase()
        formattedCompanyName = companyXeroName.replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, " ");
        //console.log(companyXeroName);
        splitName = formattedCompanyName.split(" ");
        companyFirstWord = splitName[0];
        //console.log(companyFirstWord);
        if("the" === companyFirstWord) {
            companyFirstWord = `${splitName[0]} ${splitName[1]}`;
            //console.log('change from "the", ', companyFirstWord);
        }

        if(!xeroFirstNameWords[companyFirstWord]) {
            xeroFirstNameWords[companyFirstWord] = companyXeroName;
        } else {
            //console.log('duplicate key!', formattedCompanyName, xeroFirstNameWords[companyFirstWord]);
            xeroFirstNameWords[formattedCompanyName] = formattedCompanyName;
            //console.log('xeroFirstNameWords[formattedCompanyName]: ', xeroFirstNameWords[formattedCompanyName]);
        }

        //console.log('/n*******');
    }

    let companyTrackerName;
    let companyTrackerFirstWord;
    let formattedTrackerCompanyName;
    let splitTrackerName;

    const colIndexTrackerCompanyName = _getColumnIndexByName('Company Name (Revenue Sheet)', sheetValuesSubT);

    for(let i = 1, row; i < sheetValuesSubT.length; i += 1) {
        row = sheetValuesSubT[i];
        companyTrackerName = row[colIndexTrackerCompanyName - 1].toLowerCase()
        formattedTrackerCompanyName = companyTrackerName.replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, " ");
        //console.log(companyXeroName);
        splitTrackerName = formattedTrackerCompanyName.split(" ");
        companyTrackerFirstWord = splitTrackerName[0];
        if(xeroFirstNameWords[companyTrackerFirstWord]){
            console.log('immediate match!\n');
            console.log(companyTrackerName, '\n');
            console.log(xeroFirstNameWords[companyTrackerFirstWord], '\n');
            console.log('\n********');
        }
    }
};



const _setXeroCountryLocation = function(){
    const sheetXero= SpreadsheetApp.getActive().getSheetByName("Xero List");
    const sheetValuesXero = sheetXero.getDataRange().getValues();

    const sheetSubT = SpreadsheetApp.getActive().getSheetByName("EIN Submission Tracker");
    const sheetValuesSubT = sheetSubT.getDataRange().getValues();

    const colIndexPOCountry = _getColumnIndexByName('POCountry', sheetValuesXero);
    const colIndexCountryFB = _getColumnIndexByName('SAAddressLine3', sheetValuesXero);
    const colIndexPORegion = _getColumnIndexByName('PORegion', sheetValuesXero);
    const colIndexCompanyName = _getColumnIndexByName('*ContactName', sheetValuesXero);

    let companyXeroName;
    let xeroCountry;
    let xeroCountryFallback;
    let isUSACompany;
    let xeroState;
    // array index at 0!
    for(let i = 1, row; i < sheetValuesXero.length; i += 1) {
        row = sheetValuesXero[i];
        companyXeroName = row[colIndexCompanyName - 1];
        xeroCountry = row[colIndexPOCountry - 1];
        xeroCountryFallback = row[colIndexCountryFB - 1];
        isUSACompany = _isUSACompany(xeroCountry, xeroCountryFallback);
        if(isUSACompany) {
            console.log('US Company: ', companyXeroName);
            xeroState = row[colIndexPORegion - 1];
            console.log(sheetXero.getRange(i + 1, 1).getValue());
            console.log(sheetXero.getRange(i + 1, colIndexPOCountry).getValue());
            console.log(sheetXero.getRange(i + 1, colIndexCountryFB).getValue());

            sheetXero.getRange(i + 1, colIndexPOCountry).setValue("USA");
            sheetXero.getRange(i + 1, colIndexCountryFB).setValue("USA");
            console.log('**************\n');
        }
    }
};