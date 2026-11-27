document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================
  // 1. KONTAKTŲ FORMA (contact.html)
  // ==========================================================
  const contactForm = document.getElementById('customContactForm');
  const resultContainer = document.getElementById('formResultContainer');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');

  if (contactForm) {
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

    const lettersOnlyRegex = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ltPhoneRegex = /^\+370 6\d{2} \d{5}$/;

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

    function validateRatings() {
      return ratings.every((item) => {
        const val = Number(item.slider.value);
        return !Number.isNaN(val) && val >= 1 && val <= 10;
      });
    }

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

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Object.keys(fields).forEach((key) => {
          const field = fields[key];
          field.input.value = '';
          field.touched = false;
          field.input.classList.remove('input-error');
          field.error.textContent = '';
        });

        ratings.forEach((item) => {
          item.slider.value = '1';
          if (item.display) {
            item.display.textContent = '1';
          }
        });

        resultContainer.innerHTML = '';
        validateAll();
      });
    }

    validateAll();

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
  }

  // ==========================================================
  // 2. KOMPETENCIJŲ PAŽANGOS MODULIS (kompetencijos.html)
  // ==========================================================
  const kanbanBoard = document.querySelector('.kanban-board');

  if (kanbanBoard) {
    const STORAGE_KEY = 'pijus_skill_kanban_statuses_v1';

    // Pradinės masyve nurodytos įgūdžių reikšmės (1c)
    const defaultSkillsData = [
      {
        title: 'FPGA ir Verilog pagrindai',
        status: 'Planuojama',
        xp: 70,
        icon: 'bi-cpu'
      },
      {
        title: 'RF schemų ir antenų derinimas',
        status: 'Planuojama',
        xp: 60,
        icon: 'bi-broadcast'
      },
      {
        title: 'STM32 ARM programavimas',
        status: 'Mokomasi',
        xp: 60,
        icon: 'bi-motherboard'
      },
      {
        title: 'Daugiasluoksnis PCB išdėstymas',
        status: 'Mokomasi',
        xp: 50,
        icon: 'bi-diagram-3'
      },
      {
        title: 'JavaScript ir DOM valdymas',
        status: 'Mokomasi',
        xp: 30,
        icon: 'bi-filetype-js'
      },
      {
        title: 'Embedded C/C++ architektūra',
        status: 'Atlikta',
        xp: 60,
        icon: 'bi-code-square'
      },
      {
        title: 'Osciloskopo ir signalų analizė',
        status: 'Atlikta',
        xp: 40,
        icon: 'bi-activity'
      },
      {
        title: 'Python duomenų apdorojimas',
        status: 'Atlikta',
        xp: 40,
        icon: 'bi-terminal'
      }
    ];

    // 1b, 1c. Būsenų atkūrimas iš Local Storage arba pradinių reikšmių naudojimas
    function loadSkillsFromStorage() {
      try {
        const savedRaw = localStorage.getItem(STORAGE_KEY);
        if (!savedRaw) {
          return defaultSkillsData.map((skill) => ({ ...skill }));
        }

        const savedMap = JSON.parse(savedRaw);
        const validStatuses = ['Planuojama', 'Mokomasi', 'Atlikta'];

        return defaultSkillsData.map((skill) => {
          const savedStatus = savedMap[skill.title];
          return {
            ...skill,
            status: validStatuses.includes(savedStatus) ? savedStatus : skill.status
          };
        });
      } catch (error) {
        return defaultSkillsData.map((skill) => ({ ...skill }));
      }
    }

    // 1a. Esamų įgūdžių būsenų išsaugojimas į Local Storage
    function saveSkillsToStorage(data) {
      const statusMap = {};
      data.forEach((skill) => {
        statusMap[skill.title] = skill.status;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
    }

    const skillsData = loadSkillsFromStorage();

    const containers = {
      Planuojama: document.getElementById('cards-planned'),
      Mokomasi: document.getElementById('cards-learning'),
      Atlikta: document.getElementById('cards-done')
    };

    const statusClasses = {
      Planuojama: { iconClass: 'icon-planned', badgeClass: 'status-planned' },
      Mokomasi: { iconClass: 'icon-learning', badgeClass: 'status-learning' },
      Atlikta: { iconClass: 'icon-done', badgeClass: 'status-done' }
    };

    const totalXpElement = document.querySelector('.stat-xp .stat-value');
    const levelElement = document.querySelector('.stat-level .stat-value');
    const rankElement = document.querySelector('.stat-rank .stat-value');
    const progressLabelElement = document.querySelector('.level-progress-wrapper .fw-semibold');
    const progressStatsElement = document.querySelector('.level-progress-wrapper .text-gold');
    const progressBarElement = document.querySelector('.level-progress-wrapper .progress-bar');
    const metaStatsStrongElements = document.querySelectorAll('.meta-stats strong');

    // Lygio, rango ir progreso duomenų apskaičiavimas
    function calculateProgressInfo(xp) {
      if (xp >= 300) {
        return {
          level: 4,
          rank: 'Profesionalas',
          percent: 100,
          labelText: 'Pasiektas maksimalus lygis (4 lygis – Profesionalas)',
          statsText: `100% (${xp} / 300 XP)`
        };
      } else if (xp >= 150) {
        const percent = Math.round(((xp - 150) / (300 - 150)) * 100);
        return {
          level: 3,
          rank: 'Specialistas',
          percent,
          labelText: 'Progresas iki kito lygio (4 lygis – Profesionalas)',
          statsText: `${percent}% (${xp} / 300 XP)`
        };
      } else if (xp >= 50) {
        const percent = Math.round(((xp - 50) / (150 - 50)) * 100);
        return {
          level: 2,
          rank: 'Praktikantas',
          percent,
          labelText: 'Progresas iki kito lygio (3 lygis – Specialistas)',
          statsText: `${percent}% (${xp} / 150 XP)`
        };
      } else {
        const percent = Math.round((xp / 50) * 100);
        return {
          level: 1,
          rank: 'Pradedantysis',
          percent,
          labelText: 'Progresas iki kito lygio (2 lygis – Praktikantas)',
          statsText: `${percent}% (${xp} / 50 XP)`
        };
      }
    }

    // Visos suvestinės ir pažangos statistikos perskaičiavimas
    function updateSummaryStats() {
      const completedSkills = skillsData.filter((skill) => skill.status === 'Atlikta');
      const completedXP = completedSkills.reduce((sum, skill) => sum + skill.xp, 0);
      const info = calculateProgressInfo(completedXP);

      if (totalXpElement) totalXpElement.textContent = `${completedXP} XP`;
      if (levelElement) levelElement.textContent = info.level;
      if (rankElement) rankElement.textContent = info.rank;

      if (progressLabelElement) progressLabelElement.textContent = info.labelText;
      if (progressStatsElement) progressStatsElement.textContent = info.statsText;

      if (progressBarElement) {
        progressBarElement.style.width = `${info.percent}%`;
        progressBarElement.setAttribute('aria-valuenow', info.percent);
        progressBarElement.textContent = `${info.percent}%`;
      }

      const totalSkillsCount = skillsData.length;
      const completedSkillsCount = completedSkills.length;
      const completionPercentage =
        totalSkillsCount > 0
          ? ((completedSkillsCount / totalSkillsCount) * 100).toFixed(1)
          : '0.0';

      if (metaStatsStrongElements.length >= 3) {
        metaStatsStrongElements[0].textContent = totalSkillsCount;
        metaStatsStrongElements[1].textContent = completedSkillsCount;
        metaStatsStrongElements[2].textContent = `${completionPercentage}%`;
      }
    }

    // Įgūdžio būsenos pakeitimas, išsaugojimas į Local Storage ir atnaujinimas
    function changeSkillStatus(skillIndex, newStatus) {
      if (skillsData[skillIndex] && skillsData[skillIndex].status !== newStatus) {
        skillsData[skillIndex].status = newStatus;
        saveSkillsToStorage(skillsData);
        renderSkillCards();
        updateSummaryStats();
      }
    }

    // Įgūdžių kortelių dinaminis atvaizdavimas
    function renderSkillCards() {
      Object.values(containers).forEach((container) => {
        if (container) container.innerHTML = '';
      });

      skillsData.forEach((skill, index) => {
        const targetContainer = containers[skill.status];
        const styleInfo = statusClasses[skill.status];

        if (!targetContainer || !styleInfo) return;

        const cardHTML = `
          <div class="skill-kanban-card">
            <div class="card-icon ${styleInfo.iconClass}"><i class="bi ${skill.icon}"></i></div>
            <div class="card-details">
              <h5>${skill.title}</h5>
              <div class="card-badges">
                <span class="badge-status ${styleInfo.badgeClass}">Būsena: ${skill.status}</span>
                <span class="badge-xp">XP: ${skill.xp}</span>
              </div>
              <div class="status-switcher">
                <button type="button" class="status-btn ${skill.status === 'Planuojama' ? 'active-planned' : ''}" data-index="${index}" data-status="Planuojama">Planuojama</button>
                <button type="button" class="status-btn ${skill.status === 'Mokomasi' ? 'active-learning' : ''}" data-index="${index}" data-status="Mokomasi">Mokomasi</button>
                <button type="button" class="status-btn ${skill.status === 'Atlikta' ? 'active-done' : ''}" data-index="${index}" data-status="Atlikta">Atlikta</button>
              </div>
            </div>
          </div>
        `;

        targetContainer.insertAdjacentHTML('beforeend', cardHTML);
      });

      kanbanBoard.querySelectorAll('.status-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
          const skillIndex = Number(event.currentTarget.dataset.index);
          const newStatus = event.currentTarget.dataset.status;
          changeSkillStatus(skillIndex, newStatus);
        });
      });
    }

    // Pradinis paleidimas
    renderSkillCards();
    updateSummaryStats();
  }
});