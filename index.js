const einForm = document.getElementById('ein_form');
const domesticCompanyFS = document.getElementById('domestic-company');
const foreignCompanyFS = document.getElementById('foreign-company');
const countrySelect = foreignCompanyFS.querySelector('select');
const einInputs = domesticCompanyFS.querySelectorAll('input');


const _checkForMultiDigits = function (elem) {
    const multiDigitInput = !elem.value.match(/^(?<!\d)\d$/);
    console.log(multiDigitInput);
    if(multiDigitInput) {
        elem.setCustomValidity('Please enter a single digit between 0 and 9');
        elem.reportValidity();
    } else {
        elem.setCustomValidity('');
    }
    console.log('elkem ', elem.checkValidity());
}
/**
 *
 * @param {boolean} wipeValue removes data input in 'foreign-country' radio option
 * @private
 */
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

/**
 *
 * @param {boolean} wipeValue removes data input in 'domestic-country' radio selection
 * @private
 */
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
};

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
    if('number' === elem.type) {
        _checkForMultiDigits(elem);
    }
});

document.addEventListener('input', e => {
    const elem = e.target;
    if('number' === elem.type) {
       _checkForMultiDigits(elem);
    }
});
document.addEventListener('submit', function (e){
    e.preventDefault();
    if(foreignCompanyFS.querySelector('input').checked) {
        _foreignCountrySelected(true);
    } else {
        _domesticCountrySelected(true);
    }
    e.target.submit();
    // TODO: update UI as form is submitting, prior to
});

document.addEventListener('click', e => {
    if(e.target.type === "submit") {
        const invalids = document.querySelectorAll(":invalid");
        // Chrome will flag invalid inputs in non-focusable fields prior to form 'submit' event
        invalids.forEach(elem => {
            const tagName = elem.tagName;
            if(tagName === "SELECT" || tagName === "INPUT") {
                elem.value = "";
            }
        });
    }
});

window.addEventListener('load', () => {
    if(foreignCompanyFS.querySelector('input').checked) {
        _foreignCountrySelected();
    } else {
        _domesticCountrySelected();
    }
});