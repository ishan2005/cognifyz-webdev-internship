/**
 * DataVault — Task 02: Client-Side Form Validation
 * Real-time inline validation on every input event.
 * Mirrors the same rules used server-side in server.js
 */

(function () {
  'use strict';

  // ─── Grab Elements ───────────────────────────────────────────
  const form            = document.getElementById('registerForm');
  const nameInput       = document.getElementById('name');
  const emailInput      = document.getElementById('email');
  const passwordInput   = document.getElementById('password');
  const confirmInput    = document.getElementById('confirmPassword');
  const phoneInput      = document.getElementById('phone');
  const dobInput        = document.getElementById('dob');
  const submitBtn       = document.getElementById('submitBtn');
  const togglePass      = document.getElementById('togglePass');
  const eyeIcon         = document.getElementById('eyeIcon');
  const strengthFill    = document.getElementById('strengthFill');

  // Checklist items
  const chkLen   = document.getElementById('chk-len');
  const chkUpper = document.getElementById('chk-upper');
  const chkNum   = document.getElementById('chk-num');
  const chkMatch = document.getElementById('chk-match');

  if (!form) return; // not on register page

  // ─── Helpers ────────────────────────────────────────────────

  function setValid(input, iconId, msgId, successText) {
    input.classList.remove('is-error');
    input.classList.add('is-valid');
    const icon = document.getElementById(iconId);
    const msg  = document.getElementById(msgId);
    if (icon) { icon.className = 'gh-input-icon bi bi-check-circle-fill icon-valid'; }
    if (msg && successText) {
      msg.innerHTML = `<span class="msg-success"><i class="bi bi-check-circle-fill"></i> ${successText}</span>`;
    } else if (msg) {
      msg.innerHTML = '';
    }
  }

  function setError(input, iconId, msgId, errorText) {
    input.classList.add('is-error');
    input.classList.remove('is-valid');
    const icon = document.getElementById(iconId);
    const msg  = document.getElementById(msgId);
    if (icon) { icon.className = 'gh-input-icon bi bi-x-circle-fill icon-error'; }
    if (msg) {
      msg.innerHTML = `<span class="msg-error"><i class="bi bi-x-circle-fill"></i> ${errorText}</span>`;
    }
  }

  function clearState(input, iconId) {
    input.classList.remove('is-error', 'is-valid');
    const icon = document.getElementById(iconId);
    if (icon) icon.className = 'gh-input-icon';
  }

  // ─── Name Validation ────────────────────────────────────────
  function validateName() {
    const v = nameInput.value.trim();
    if (!v) { clearState(nameInput, 'nameIcon'); document.getElementById('nameMsg').innerHTML = ''; return false; }
    if (v.length < 2) { setError(nameInput, 'nameIcon', 'nameMsg', 'Name must be at least 2 characters.'); return false; }
    setValid(nameInput, 'nameIcon', 'nameMsg', 'Looks good!');
    return true;
  }

  // ─── Email Validation ────────────────────────────────────────
  function validateEmail() {
    const v   = emailInput.value.trim();
    const rx  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!v) { clearState(emailInput, 'emailIcon'); document.getElementById('emailMsg').innerHTML = ''; return false; }
    if (!rx.test(v)) { setError(emailInput, 'emailIcon', 'emailMsg', 'Enter a valid email address.'); return false; }
    setValid(emailInput, 'emailIcon', 'emailMsg', 'Valid email address.');
    return true;
  }

  // ─── Password Validation + Strength ─────────────────────────
  function validatePassword() {
    const v     = passwordInput.value;
    const hasLen   = v.length >= 8;
    const hasUpper = /[A-Z]/.test(v);
    const hasNum   = /\d/.test(v);

    // Update checklist
    chkLen.classList.toggle('pass', hasLen);
    chkUpper.classList.toggle('pass', hasUpper);
    chkNum.classList.toggle('pass', hasNum);

    // Strength bar
    const score = [hasLen, hasUpper, hasNum].filter(Boolean).length;
    const map   = { 0: ['0%', ''], 1: ['33%', 'strength-weak'], 2: ['66%', 'strength-fair'], 3: ['100%', 'strength-strong'] };
    if (v.length === 0) {
      strengthFill.style.width = '0%';
      strengthFill.className   = 'gh-strength-fill';
    } else {
      strengthFill.style.width = map[score][0];
      strengthFill.className   = `gh-strength-fill ${map[score][1]}`;
    }

    if (!v) { clearState(passwordInput, null); return false; }
    if (!hasLen || !hasUpper || !hasNum) {
      passwordInput.classList.add('is-error');
      passwordInput.classList.remove('is-valid');
      return false;
    }
    passwordInput.classList.remove('is-error');
    passwordInput.classList.add('is-valid');
    // Re-check confirm if already filled
    if (confirmInput.value) validateConfirm();
    return true;
  }

  // ─── Confirm Password ────────────────────────────────────────
  function validateConfirm() {
    const v = confirmInput.value;
    if (!v) { clearState(confirmInput, 'confirmIcon'); document.getElementById('confirmMsg').innerHTML = ''; return false; }
    if (v !== passwordInput.value) {
      setError(confirmInput, 'confirmIcon', 'confirmMsg', 'Passwords do not match.');
      chkMatch.classList.remove('pass');
      return false;
    }
    setValid(confirmInput, 'confirmIcon', 'confirmMsg', 'Passwords match!');
    chkMatch.classList.add('pass');
    return true;
  }

  // ─── Phone Validation ────────────────────────────────────────
  function validatePhone() {
    const v  = phoneInput.value.replace(/\s/g, '');
    const rx = /^[6-9]\d{9}$/;
    if (!v) { clearState(phoneInput, 'phoneIcon'); document.getElementById('phoneMsg').innerHTML = '<span style="color:var(--gh-text-3);font-size:12px">10-digit Indian mobile number</span>'; return false; }
    if (!rx.test(v)) { setError(phoneInput, 'phoneIcon', 'phoneMsg', 'Enter a valid 10-digit Indian mobile number.'); return false; }
    setValid(phoneInput, 'phoneIcon', 'phoneMsg', 'Valid phone number.');
    return true;
  }

  // ─── DOB Validation ─────────────────────────────────────────
  function validateDob() {
    const v = dobInput.value;
    if (!v) { clearState(dobInput, 'dobIcon'); document.getElementById('dobMsg').innerHTML = '<span style="color:var(--gh-text-3);font-size:12px">Must be 18 years or older</span>'; return false; }
    const birth = new Date(v);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 18) { setError(dobInput, 'dobIcon', 'dobMsg', 'You must be at least 18 years old.'); return false; }
    setValid(dobInput, 'dobIcon', 'dobMsg', `Age: ${age} years`);
    return true;
  }

  // ─── Attach Events ───────────────────────────────────────────
  nameInput.addEventListener('input', validateName);
  nameInput.addEventListener('blur', validateName);

  emailInput.addEventListener('input', validateEmail);
  emailInput.addEventListener('blur', validateEmail);

  passwordInput.addEventListener('input', validatePassword);
  passwordInput.addEventListener('blur', validatePassword);

  confirmInput.addEventListener('input', validateConfirm);
  confirmInput.addEventListener('blur', validateConfirm);

  phoneInput.addEventListener('input', validatePhone);
  phoneInput.addEventListener('blur', validatePhone);

  dobInput.addEventListener('change', validateDob);
  dobInput.addEventListener('blur', validateDob);

  // ─── Show / Hide Password ─────────────────────────────────
  if (togglePass) {
    togglePass.addEventListener('click', () => {
      const isPass = passwordInput.type === 'password';
      passwordInput.type = isPass ? 'text' : 'password';
      eyeIcon.className  = isPass ? 'bi bi-eye-slash' : 'bi bi-eye';
    });
  }

  // ─── Phone: digits only ──────────────────────────────────────
  phoneInput.addEventListener('keypress', (e) => {
    if (!/\d/.test(e.key)) e.preventDefault();
  });

  // ─── Form Submit Guard ────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    const results = [
      validateName(),
      validateEmail(),
      validatePassword(),
      validateConfirm(),
      validatePhone(),
      validateDob(),
    ];

    if (results.includes(false)) {
      e.preventDefault();
      // Scroll to first error
      const firstError = form.querySelector('.is-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Submitting...';
    }
  });

})();
