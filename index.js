const einForm = document.getElementById('ein_form');
const domesticCompanyFS = document.getElementById('domestic-company');
const foreignCompanyFS = document.getElementById('foreign-company');
const countrySelect = foreignCompanyFS.querySelector('select');
const taxExemptFieldset = document.getElementById('tax-exempt-fieldset');
const einFieldSet = document.getElementById('ein-fieldset');
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
}

const _clearEINValues = function () {
    einInputs.forEach(elem => {
        elem.removeAttribute('required');
        if(wipeValue) {
            elem.value = "";
        }
    });
};
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
    document.getElementById('foreign-fieldset').classList.add('hidden');
    taxExemptFieldset.classList.remove('hidden')
    if('no' === taxExemptFieldset.querySelector(':checked').value.toLowerCase()) {
        document.getElementById('ein-fieldset').classList.remove('hidden');
    }
    taxExemptFieldset.querySelectorAll('[required]').forEach(r => r.setAttribute('required', 'required'));
    einInputs.forEach(elem => {
        elem.setAttribute('required', 'required');
    })
};

const _setUIFormSubmit = function (form) {
    const spinner = document.createElement('div');
    spinner.classList.add('submit-spinner');
    spinner.innerHTML = `
                <p>
                    <span></span><br/>Submitting form...
                </p>`;
    form.parentNode.insertBefore(spinner, form);
    form.classList.add('hidden')
};

const _setUISuccessMsg = function () {
    const s = document.querySelector('.submit-spinner');
    if(s) {
        s.innerHTML = `<div class="success"><span>✅</span>
            <h2>Success!</h2>
            <p>Your submission has been received.</p>
        </div>`;
    }
};

/**
 * @param {boolean} wipeValue removes data input in 'domestic-country' radio selection
 * @private
 */
const _foreignCountrySelected = function (wipeValue = false) {
    countrySelect.setAttribute('required', 'required');
    document.getElementById('foreign-fieldset').classList.remove('hidden');
    document.getElementById('ein-fieldset').classList.add('hidden');
    document.getElementById('tax-exempt-fieldset').classList.add('hidden');
    taxExemptFieldset.querySelectorAll('[required]').forEach(r => r.removeAttribute('required'));
    _clearEINValues();
};

document.addEventListener('change', function (e){
    const elem = e.target;
    if('radio' === elem.type && 'country-of-origin' === elem.name) {
        const parentFS = elem.parentNode.parentNode;
        if(parentFS.id === "domestic-company") {
            _domesticCountrySelected();
        } else {
            _foreignCountrySelected();
        }
    }
    if('radio' === elem.type && 'tax-exempt' === elem.name) {
        if('yes' === elem.value.toLowerCase()) {
            einFieldSet.classList.add('hidden');
        } else {
            einFieldSet.classList.remove('hidden');
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
        if('yes' === taxExemptFieldset.querySelector(':checked').value.toLowerCase()) {
            // avoid passing to back end
            _clearEINValues();
        }
    }
    const form = e.target;

    _setUIFormSubmit(form);
    form.remove();
    fetch('https://script.google.com/macros/s/AKfycbwC6vnoawSU_jMhzb0YCd-xXeYMQaEPAeBKo5oGQYPJxGX3nriENjTPNDudo5N9bYRq/exec',
        {
            method:'post',
            body: new FormData(form)
        }).then((r) => {
           setTimeout(()=>{
               if(r.status === 200 || r.ok === true) {
                   _setUISuccessMsg(form);
               } else {
                   //todo: server error message
               }
           }, 2000)
        }).catch( e=> {
            //todo: network error
        }).finally( () => {

        });
});

document.addEventListener('click', e => {
    if(e.target.type === "submit") {
        const invalids = document.querySelectorAll(":invalid");
        // Chrome will flag invalid inputs in non-focusable fields prior to form 'submit' event
        invalids.forEach(elem => {
            const tagName = elem.tagName;
            if(tagName === "SELECT" || tagName === "INPUT") {
                elem.value = "";
                elem.setCustomValidity('');
                elem.reportValidity();
            }
        });
    }
});

window.addEventListener('load', () => {
    // in event of user back naving post-submission
    const spinner = document.querySelector('.spinner');
    if(spinner) spinner.remove();
    einForm.classList.remove('hidden');
    if(foreignCompanyFS.querySelector('input').checked) {
        _foreignCountrySelected();
    } else {
        _domesticCountrySelected();
    }
});