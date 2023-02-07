
const _getColumnIndexByName = function(colName) {
    const header = sheetValuesSubT[0];
    for(let i = 0, name; name = header[i]; i+= 1) {
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
    for(let rowIndex = 1, record; record = sheetValuesSubT[rowIndex]; rowIndex +=1){
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