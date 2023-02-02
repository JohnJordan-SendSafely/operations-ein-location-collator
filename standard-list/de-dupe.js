const fs = require("fs");
const raw = fs.readFileSync('ein-api-results.json', 'utf-8');
const a = JSON.parse(raw).data;

// const a = [
//         {
//         "companyId": "31893961",
//         "ein": "900351836",
//         "companyName": "AMAZON COM",
//         "address": "1453 E 10TH ST",
//         "address2": "",
//         "city": "JEFFERSONVILLE",
//         "state": "IN",
//         "zipCode": "471304204",
//         "telephone": null,
//         "fax": "",
//         "website": null,
//         "firstName": "",
//         "middleName": "",
//         "lastName": "",
//         "email": "",
//         "sic": null,
//         "totalEmployees": null,
//         "salesRevenue": null,
//         "headQuarter": "",
//         "ncoa": null,
//         "dateAcquired": "2016 or older",
//         "ncoaUpdateDate": "2022-04",
//         "otherPossibleNames": null
//     },
//     {
//         "companyId": "31893961",
//         "ein": "900351836",
//         "companyName": "AMAZON COM",
//         "address": "1453 E 10TH ST",
//         "address2": "",
//         "city": "JEFFERSONVILLE",
//         "state": "IN",
//         "zipCode": "471304204",
//         "telephone": null,
//         "fax": "",
//         "website": null,
//         "firstName": "",
//         "middleName": "",
//         "lastName": "",
//         "email": "",
//         "sic": null,
//         "totalEmployees": null,
//         "salesRevenue": null,
//         "headQuarter": "",
//         "ncoa": null,
//         "dateAcquired": "2016 or older",
//         "ncoaUpdateDate": "2022-04",
//         "otherPossibleNames": null
//     }
// ];

let b = a.filter((rec, currIndex, self) => {
    const firstIndexPos = self.findIndex(t => t.ein === rec.ein);
    // not a duplicate if first occurrence is same as current index position
    return currIndex === firstIndexPos;
});

console.log(a.length, b.length);