document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('customContactForm');
  const resultContainer = document.getElementById('formResultContainer');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');

  if (!contactForm) return;

  const fields = {
    firstName: {
      input: document.getElementById('firstName'),
      error: document.getElementById('firstNameError'),
      touched: false
    },
    lastName: {
      input: document.getElementById('lastName'),
      error: document.getElementById('lastNameError'),
      touched: false
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('emailError'),
      touched: false
    },
    phone: {
      input: document.getElementById('phone'),
      error: document.getElementById('phoneError'),
      touched: false
    },
    address: {
      input: document.getElementById('address'),
      error: document.getElementById('addressError'),
      touched: false
    }
  };

  const ratings = [
    {
      slider: document.getElementById('ratingDesign'),
      display: document.getElementById('ratingDesignValue')
    },
    {
      slider: document.getElementById('ratingContent'),
      display: document.getElementById('ratingContentValue')
    },
    {
      slider: document.getElementById('ratingUsability'),
      display: document.getElementById('ratingUsabilityValue')
    }
  ];

  // Reguliarūs reiškiniai (Regex)
  const lettersOnlyRegex = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ltPhoneRegex = /^\+370 6\d{2} \d{5}$/;

  // 2a, 2b, 2c. Telefono numerio formatavimo realiu laiku funkcija (+370 6xx xxxxx)
  function formatLithuanianPhone(rawValue) {
    let digits = rawValue.replace(/\D/g, '');

    if (digits.length === 0) {
      return '';
    }

    if (digits.startsWith('86')) {
      digits = '370' + digits.slice(1);
    } else if (digits.startsWith('6')) {
      digits = '370' + digits;
    } else if (!digits.startsWith('370')) {
      if (digits.startsWith('37')) {
        digits = '370' + digits.slice(2);
      } else if (digits.startsWith('3')) {
        digits = '370' + digits.slice(1);
      } else {
        digits = '370' + digits;
      }
    }

    digits = digits.slice(0, 11);

    let formatted = '+370';
    const subscriberPart = digits.slice(3);

    if (subscriberPart.length > 0) {
      formatted += ' ' + subscriberPart.slice(0, 3);
    }
    if (subscriberPart.length > 3) {
      formatted += ' ' + subscriberPart.slice(3, 8);
    }

    return formatted;
  }

  // Atskiro lauko validacijos funkcija (1a, 1b, 1c, 1f, 2c)
  function validateField(key) {
    const field = fields[key];
    const value = field.input.value.trim();
    let errorMessage = '';

    if (value === '') {
      errorMessage = 'Šis laukas yra privalomas.';
    } else if (key === 'firstName' || key === 'lastName') {
      if (!lettersOnlyRegex.test(value)) {
        errorMessage = 'Lauke gali būti įvestos tik raidės.';
      }
    } else if (key === 'email') {
      if (!emailRegex.test(value)) {
        errorMessage = 'Įveskite teisingą el. pašto adresą (pvz., vardas@pastas.lt).';
      }
    } else if (key === 'phone') {
      if (!ltPhoneRegex.test(value)) {
        errorMessage = 'Numeris turi atitikti formatą +370 6xx xxxxx.';
      }
    }

    if (field.touched) {
      if (errorMessage !== '') {
        field.input.classList.add('input-error');
        field.error.textContent = errorMessage;
      } else {
        field.input.classList.remove('input-error');
        field.error.textContent = '';
      }
    } else {
      field.input.classList.remove('input-error');
      field.error.textContent = '';
    }

    return errorMessage === '';
  }

  // 1d. Vertinimo klausimų reikšmės turi būti nuo 1 iki 10
  function validateRatings() {
    return ratings.every((item) => {
      const val = Number(item.slider.value);
      return !Number.isNaN(val) && val >= 1 && val <= 10;
    });
  }

  // Visos formos būsenos tikrinimas (1e)
  function validateAll() {
    const isFirstNameValid = validateField('firstName');
    const isLastNameValid = validateField('lastName');
    const isEmailValid = validateField('email');
    const isPhoneValid = validateField('phone');
    const isAddressValid = validateField('address');
    const areRatingsValid = validateRatings();

    const isFormValid =
      isFirstNameValid &&
      isLastNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isAddressValid &&
      areRatingsValid;

    submitBtn.disabled = !isFormValid;
    return isFormValid;
  }

  // Prijungiame įvykių klausytojus kiekvienam laukui
  Object.keys(fields).forEach((key) => {
    const field = fields[key];

    field.input.addEventListener('input', (e) => {
      field.touched = true;

      if (key === 'phone') {
        if (e.inputType === 'deleteContentBackward' && field.input.value === '+370') {
          field.input.value = '';
        } else {
          field.input.value = formatLithuanianPhone(field.input.value);
        }
      }

      validateAll();
    });

    field.input.addEventListener('blur', () => {
      field.touched = true;
      validateAll();
    });
  });

  ratings.forEach((item) => {
    item.slider.addEventListener('input', () => {
      if (item.display) {
        item.display.textContent = item.slider.value;
      }
      validateAll();
    });
  });

  // 3a, 3b, 3c. Mygtuko "Išvalyti" funkcionalumas
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      // Išvalome visus tekstinius laukus ir nuimame klaidas
      Object.keys(fields).forEach((key) => {
        const field = fields[key];
        field.input.value = '';
        field.touched = false;
        field.input.classList.remove('input-error');
        field.error.textContent = '';
      });

      // Grąžiname visus slankiklius į pradinę vertę (1)
      ratings.forEach((item) => {
        item.slider.value = '1';
        if (item.display) {
          item.display.textContent = '1';
        }
      });

      // Išvalome formos apačioje atvaizduotus duomenis ir vidurkį
      resultContainer.innerHTML = '';

      // Atnaujiname mygtuko "Siųsti" būseną (vėl tampa neaktyvus)
      validateAll();
    });
  }

  // Pradinis patikrinimas
  validateAll();

  // Formos pateikimas (4 ir 5 punktai)
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    Object.keys(fields).forEach((key) => {
      fields[key].touched = true;
    });
    if (!validateAll()) return;

    const formData = {
      vardas: fields.firstName.input.value.trim(),
      pavarde: fields.lastName.input.value.trim(),
      elPastas: fields.email.input.value.trim(),
      telefonas: fields.phone.input.value.trim(),
      adresas: fields.address.input.value.trim(),
      vertinimasDizainas: Number(document.getElementById('ratingDesign').value),
      vertinimasInformacija: Number(document.getElementById('ratingContent').value),
      vertinimasPatogumas: Number(document.getElementById('ratingUsability').value)
    };

    const averageScore = (
      (formData.vertinimasDizainas +
        formData.vertinimasInformacija +
        formData.vertinimasPatogumas) / 3
    ).toFixed(1);

    console.log('Pateikti kontaktų formos duomenys:', formData);
    console.log(`${formData.vardas} ${formData.pavarde}: ${averageScore}`);

    resultContainer.innerHTML = `
      <div class="p-4 rounded" style="background-color: #0b1d16; border: 1px solid rgba(212, 175, 55, 0.4); color: #f3f1ed;">
        <h5 class="mb-3" style="color: #d4af37;">Pateikti duomenys:</h5>
        <p class="mb-1"><strong>Vardas:</strong> ${formData.vardas}</p>
        <p class="mb-1"><strong>Pavardė:</strong> ${formData.pavarde}</p>
        <p class="mb-1"><strong>El. paštas:</strong> <a href="mailto:${formData.elPastas}" style="color: #d4af37;">${formData.elPastas}</a></p>
        <p class="mb-1"><strong>Tel. Numeris:</strong> ${formData.telefonas}</p>
        <p class="mb-1"><strong>Adresas:</strong> ${formData.adresas}</p>
        <p class="mb-1"><strong>1. Svetainės dizaino ir spalvų vertinimas:</strong> ${formData.vertinimasDizainas} / 10</p>
        <p class="mb-1"><strong>2. Informacijos aiškumo vertinimas:</strong> ${formData.vertinimasInformacija} / 10</p>
        <p class="mb-1"><strong>3. Patogumo ir navigacijos vertinimas:</strong> ${formData.vertinimasPatogumas} / 10</p>
        <p class="mb-0" style="color: #d4af37;"><strong>${formData.vardas} ${formData.pavarde}: ${averageScore}</strong></p>
      </div>
    `;
  });
});