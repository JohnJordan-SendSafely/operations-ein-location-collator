
const domesticCompanyFS = document.getElementById('domestic-company');
const foreignCompanyFS = document.getElementById('foreign-company');

const countrySelect = foreignCompanyFS.querySelector('select');
const einInputs = domesticCompanyFS.querySelectorAll('input');

const _domesticCountrySelected = function () {
    countrySelect.removeAttribute('required');
    countrySelect.parentElement.classList.toggle('hidden');
    domesticCompanyFS.querySelector('.nested').classList.toggle('hidden');
    einInputs.forEach(elem => {
        elem.setAttribute('required', 'required');
    })
};

const _foreignCountrySelected = function () {
    countrySelect.setAttribute('required', 'required');
    countrySelect.parentElement.classList.toggle('hidden');
    domesticCompanyFS.querySelector('.nested').classList.toggle('hidden');
    einInputs.forEach(elem => {
        elem.removeAttribute('required');
    })
}

document.addEventListener('change', function (e){
    const elem = e.target;
    console.log(elem.type, elem.getAttribute('type'))
    if('radio' === elem.type) {
        console.log(elem.parentNode.parentNode);
        const parentFS = elem.parentNode.parentNode;
        if(parentFS.id === "domestic-company") {
            _domesticCountrySelected();
        } else {
            _foreignCountrySelected();
        }
    }
});

document.addEventListener('DOMContentLoaded', e=> {
    if(foreignCompanyFS.querySelector('input').checked) {
        _foreignCountrySelected();
    } else {
        _domesticCountrySelected();
    }
});