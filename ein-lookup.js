var companyLookup = async function (companyName) {
    const APIKey = "";
    const endpoint = "https://api.einsearch.com/api/Fein/SearchByName";
    const payload = {
        "Company": companyName
    };
    const response = await fetch(endpoint, {
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
            "KEY": APIKey
        },
        method: "POST"
    });
    console.log(await response.json());
};

companyLookup("Amazon com");