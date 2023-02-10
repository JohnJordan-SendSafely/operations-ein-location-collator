const einForm = document.getElementById('ein_form');
const domesticCompanyFS = document.getElementById('domestic-company');
const foreignCompanyFS = document.getElementById('foreign-company');
const foreignCountrySelect = foreignCompanyFS.querySelector('select');
const foreignCountryList = foreignCompanyFS.querySelector("#foreign-country-list");
const taxExemptFieldset = document.getElementById('tax-exempt-fieldset');
const taxRadios = taxExemptFieldset.querySelectorAll('[type="radio"]');
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

const _clearEINInputs = function (wipeValue = false) {
    einInputs.forEach(elem => {
        elem.removeAttribute('required');
        if(wipeValue) {
            elem.value = "";
        }
    });
};

const _clearTaxExemptStatus = function (wipeValue = false) {
    taxRadios.forEach(r => {
        r.removeAttribute('required');
        if(wipeValue) {
            r.value = "";
        }
    });
};

const _domesticCountrySelected = function () {
    foreignCountrySelect.removeAttribute('required');
    foreignCountryList.classList.add('hidden');
    taxExemptFieldset.classList.remove('hidden');
    einFieldSet.classList.remove('hidden');
    einInputs.forEach(elem => {
        elem.setAttribute('required', 'required');
    });
    taxRadios.forEach(r => r.setAttribute('required', 'required'));
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
            <p>Your submission has been received. If you have any questions about this request, please contact <a href="mailto:billing@sendsafely.com">billing@sendsafely.com</a>.</p>
            <p>Thank you for being a SendSafely customer!</p>
        </div>`;
    }
};

const _foreignCountrySelected = function () {
    foreignCountrySelect.setAttribute('required', 'required');
    foreignCountryList.classList.remove('hidden');
    taxExemptFieldset.classList.add('hidden');
    einFieldSet.classList.add('hidden');
    _clearTaxExemptStatus()
    _clearEINInputs();
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

// in event of user back-navigating post-submission
window.addEventListener('load', () => {
    const spinner = document.querySelector('.spinner');
    if(spinner) spinner.remove();
    einForm.classList.remove('hidden');
    if(foreignCompanyFS.querySelector('input').checked) {
        _foreignCountrySelected();
    } else {
        _domesticCountrySelected();
    }
});