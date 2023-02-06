const fetch = require("make-fetch-happen");
/**
 * Get Company Data from Company Name search (EIN Service)
 */
const companyLookup = async function (companyName) {
    const APIKey = process.env.EIN_API_KEY;
    const endpoint = "https://api.einsearch.com/api/Fein/SearchByName";
    const payload = {
        "Company": companyName
    };
    console.log(`fetching '${companyName}' from EIN service...`);
    try {
        const response = await fetch(endpoint, {
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                "KEY": APIKey
            },
            method: "POST"
        });
        return (await response.json());
    } catch (e) {
        console.error(e);
    }
};

module.exports.companyLookup = companyLookup;