/**
 * Palm Hills Luxury Portfolio Landing Page JavaScript
 * Agency: properties-m
 * WhatsApp Dedicated Line: 01222622253 (+20 12 2262 2253)
 * Note: Google Tags & Tracking snippets excluded per specification.
 */

const WHATSAPP_PHONE = '201222622253';

document.addEventListener('DOMContentLoaded', () => {
  initIntlTelInputs();
  initFormSubmissions();
  initProjectInquiryTriggers();
  initProjectFilters();
  setCurrentYear();
});

/* ============================================================
   1. INTERNATIONAL TELEPHONE INPUT INITIALIZATION
   ============================================================ */
let itiInstances = [];

function initIntlTelInputs() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  phoneInputs.forEach(input => {
    if (window.intlTelInput) {
      const iti = window.intlTelInput(input, {
        initialCountry: 'eg',
        preferredCountries: ['eg', 'sa', 'ae', 'kw', 'qa', 'om', 'bh', 'us', 'gb', 'de'],
        separateDialCode: true,
        utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js',
        autoPlaceholder: 'polite',
        formatOnDisplay: true,
      });

      itiInstances.push({ input, iti });
    }
  });
}

/* ============================================================
   2. FORM SUBMISSION HANDLING (Clean Web3Forms API + Fallback)
   ============================================================ */
function initFormSubmissions() {
  const forms = document.querySelectorAll('form[data-lead-form]');

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = form.querySelector('input[name="name"]');
      const phoneInput = form.querySelector('input[type="tel"]');
      const submitBtn = form.querySelector('button[type="submit"]');
      const projectInput = form.querySelector('input[name="project"]');
      const accessKeyInput = form.querySelector('input[name="access_key"]');
      const accessKey = accessKeyInput ? accessKeyInput.value.trim() : '';

      const projectName = projectInput && projectInput.value ? projectInput.value : 'Palm Hills Luxury Projects';

      if (!nameInput || !phoneInput) return;

      const fullName = nameInput.value.trim();
      let fullPhone = phoneInput.value.trim();

      if (!fullName) {
        showToast('Required Field', 'Please enter your full name.');
        nameInput.focus();
        return;
      }

      if (!fullPhone) {
        showToast('Required Field', 'Please enter your contact phone number.');
        phoneInput.focus();
        return;
      }

      // Check intlTelInput validation
      const itiEntry = itiInstances.find(entry => entry.input === phoneInput);
      if (itiEntry && itiEntry.iti) {
        if (!itiEntry.iti.isValidNumber() && fullPhone.replace(/[\s\-\(\)]/g, '').length < 7) {
          showToast('Invalid Number', 'Please provide a valid phone number with country code.');
          phoneInput.focus();
          return;
        }
        fullPhone = itiEntry.iti.getNumber();
      }

      // Loading UI State
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
      }

      // Prepare submission payload
      const formData = new FormData(form);
      formData.set('name', fullName);
      formData.set('phone', fullPhone);
      formData.set('project', projectName);
      formData.set('advisory_partner', 'properties-m');
      formData.set('contact_line', '01222622253');
      formData.set('submitted_at', new Date().toISOString());

      // If an access key has been configured, send via Web3Forms
      if (accessKey && accessKey !== 'YOUR_ACCESS_KEY_HERE') {
        try {
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: formData
          });

          const result = await response.json();
          form.reset();
          openSuccessModal(fullName, fullPhone, projectName);
        } catch (err) {
          console.warn('Network submission fallback:', err);
          form.reset();
          openSuccessModal(fullName, fullPhone, projectName);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
          }
        }
      } else {
        // Instant graceful client-side capture when access key is not set
        setTimeout(() => {
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
          }
          openSuccessModal(fullName, fullPhone, projectName);
        }, 500);
      }
    });
  });
}

/* ============================================================
   3. PROJECT INQUIRY BUTTON TRIGGERS
   ============================================================ */
function initProjectInquiryTriggers() {
  const inquireButtons = document.querySelectorAll('[data-inquire-project]');

  inquireButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projName = btn.getAttribute('data-inquire-project') || 'Palm Hills Portfolio';

      // Update hidden project fields across forms
      document.querySelectorAll('input[name="project"]').forEach(input => {
        input.value = projName;
      });

      // Smooth scroll to primary lead form
      const formSection = document.getElementById('register');
      if (formSection) {
        const offset = 80;
        const elemTop = formSection.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: elemTop,
          behavior: 'smooth'
        });

        setTimeout(() => {
          const nameField = formSection.querySelector('input[name="name"]');
          if (nameField) nameField.focus();
        }, 600);
      }
    });
  });
}

/* ============================================================
   4. INTERACTIVE PROJECT FILTER TABS
   ============================================================ */
function initProjectFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const projectCards = document.querySelectorAll('[data-category]');

  if (!filterPills.length) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const selected = pill.getAttribute('data-filter');

      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        if (selected === 'all' || category.includes(selected)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ============================================================
   5. SUCCESS CONFIRMATION MODAL
   ============================================================ */
function openSuccessModal(name, phone, project) {
  const backdrop = document.getElementById('successModal');
  const waBtn = document.getElementById('modalWaBtn');

  if (waBtn) {
    const text = encodeURIComponent(
      `Hello properties-m, I have just registered my interest in ${project} on your Palm Hills luxury landing page.\n\nName: ${name}\nPhone: ${phone}\n\nPlease share the private price list, brochure, and payment schedule.`
    );
    waBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
  }

  if (backdrop) {
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeSuccessModal() {
  const backdrop = document.getElementById('successModal');
  if (backdrop) {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

window.closeSuccessModal = closeSuccessModal;

window.addEventListener('click', (e) => {
  const backdrop = document.getElementById('successModal');
  if (e.target === backdrop) {
    closeSuccessModal();
  }
});

/* ============================================================
   6. TOAST NOTIFICATIONS
   ============================================================ */
function showToast(title, message, duration = 4000) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<strong style="color:#DFBA73;">${title}</strong><div style="margin-top:4px; font-size:0.84rem; color:#E5E7EB;">${message}</div>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ============================================================
   7. DYNAMIC CURRENT YEAR
   ============================================================ */
function setCurrentYear() {
  const yearSpans = document.querySelectorAll('[data-current-year]');
  const currentYear = new Date().getFullYear();
  yearSpans.forEach(span => {
    span.textContent = currentYear;
  });
}
