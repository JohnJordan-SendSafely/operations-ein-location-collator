
const domesticCompanyFS = document.getElementById('domestic-company');
const foreignCompanyFS = document.getElementById('foreign-company');

const countrySelect = foreignCompanyFS.querySelector('select');
const einInputs = domesticCompanyFS.querySelectorAll('input');


const _domesticCountrySelected = function (wipeValue = false) {
    countrySelect.removeAttribute('required');
    if(wipeValue) {
        countrySelect.value = "";
    }
    countrySelect.parentElement.classList.add('hidden');
    domesticCompanyFS.querySelector('.nested').classList.remove('hidden');
    einInputs.forEach(elem => {
        elem.setAttribute('required', 'required');
    })
};

const _foreignCountrySelected = function (wipeValue = false) {
    countrySelect.setAttribute('required', 'required');
    countrySelect.parentElement.classList.remove('hidden');
    domesticCompanyFS.querySelector('.nested').classList.add('hidden');
    einInputs.forEach(elem => {
        elem.removeAttribute('required');
        if(wipeValue) {
            elem.value = "";
        }
    })
}

document.addEventListener('change', function (e){
    const elem = e.target;
    if('radio' === elem.type) {
        const parentFS = elem.parentNode.parentNode;
        if(parentFS.id === "domestic-company") {
            _domesticCountrySelected();
        } else {
            _foreignCountrySelected();
        }
    }
});

document.addEventListener('submit', function (e){
    console.log('submitting...');
    e.preventDefault();
    if(foreignCompanyFS.querySelector('input').checked) {
        console.log('foreign country select')
        _foreignCountrySelected(true);
    } else {
        console.log('domestic country selected');
        _domesticCountrySelected(true);
    }
    e.target.submit();
});

document.addEventListener('click', e => {
    if(e.target.type === "submit") {
        const invalids = document.querySelectorAll(":invalid");
        // Chrome will flag invalid inputs in non-focusable fields
        // prior to form 'submit' event
        invalids.forEach(elem => {
            const tagName = elem.tagName;
            if(tagName === "SELECT" || tagName === "INPUT") {
                elem.value = "";
            }
        });
    }
})

window.addEventListener('load', () => {
    if(foreignCompanyFS.querySelector('input').checked) {
        _foreignCountrySelected();
    } else {
        _domesticCountrySelected();
    }
})