const burgerMenu = document.querySelector('#burger-menu');
const menu = document.querySelector('#menu');
const crossIcon = document.querySelector('#cross-icon');
const policyLink = document.querySelector('#policy-link');
const form = document.querySelector('#form');
const nameError = document.querySelector('#name-error');
const phoneError = document.querySelector('#phone-error');

burgerMenu.addEventListener('click', () => {
    menu.classList.add('menu--active');
});

crossIcon.addEventListener('click', () => {
    menu.classList.remove('menu--active');
});

policyLink.addEventListener('click', (event) => {
    event.preventDefault();
});

form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isFormValid = true;
    const formData = serializeForm(event.target);

    formData.forEach(({name, value}) => {
        if (name === 'name') {
            if (!isNameValid(value)) {
                isFormValid = false;
                showTextError(nameError);
            } else {
                hideTextError(nameError);
            }
        } else if (name === 'phone') {
            if (!isPhoneValid(value)) {
                isFormValid = false;
                showTextError(phoneError);
            } else {
                hideTextError(phoneError);
            }
        }
    })

    if (!isFormValid) {
        return;
    }

    form.replaceWith(tmpl.content.cloneNode(true));
});

function serializeForm({elements}) {
    return Array.from(elements)
        .filter((element) => Boolean(element.name))
        .map(({ name, value }) => ({ name, value }));
}

function isNameValid(name) {
    return /^[a-zA-Zа-яА-Я\s]*$/.test(name);
}

function isPhoneValid(phone) {
    return /^\+*[\d]{10,15}$/.test(phone);
}

function showTextError(element) {
    element.classList.add('error--active');
}

function hideTextError(element) {
    element.classList.remove('error--active');
}
