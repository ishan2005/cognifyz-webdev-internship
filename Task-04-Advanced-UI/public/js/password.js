/**
 * DataVault Task 04 — Password Strength Meter
 * Entropy-based scoring with real-time feedback and password generator
 */
(function () {
  'use strict';

  const pwInput    = document.getElementById('pwInput');
  const pwFill     = document.getElementById('pwFill');
  const pwLabel    = document.getElementById('pwLabel');
  const pwEntropy  = document.getElementById('pwEntropy');
  const pwToggle   = document.getElementById('pwToggle');
  const pwEye      = document.getElementById('pwEye');
  const generateBtn= document.getElementById('generateBtn');
  const copyBtn    = document.getElementById('copyBtn');
  const suggestions= document.getElementById('pwSuggestions');

  const stats = {
    len:     document.getElementById('statLen'),
    entropy: document.getElementById('statEntropy'),
    charset: document.getElementById('statCharset'),
    score:   document.getElementById('statScore'),
  };
  const criteria = {
    len:   document.getElementById('cr-len'),
    upper: document.getElementById('cr-upper'),
    lower: document.getElementById('cr-lower'),
    num:   document.getElementById('cr-num'),
    sym:   document.getElementById('cr-sym'),
    long:  document.getElementById('cr-long'),
  };

  if (!pwInput) return;

  // Calculate charset size for entropy
  function charsetSize(pw) {
    let size = 0;
    if (/[a-z]/.test(pw)) size += 26;
    if (/[A-Z]/.test(pw)) size += 26;
    if (/\d/.test(pw))    size += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) size += 32;
    return size;
  }

  function calcEntropy(pw) {
    if (!pw) return 0;
    const cs = charsetSize(pw);
    return cs > 0 ? Math.round(pw.length * Math.log2(cs)) : 0;
  }

  function getScore(pw) {
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 16) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw))   score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score;
  }

  const labels   = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const classes  = ['str-none', 'str-weak', 'str-weak', 'str-fair', 'str-good', 'str-strong'];
  const colors   = ['', '#cf222e', '#c86000', '#c86000', '#0969da', '#1a7f37'];
  const tips = [
    'Try adding uppercase letters.',
    'Add numbers and symbols.',
    'Make it longer (16+ characters).',
    'Almost there — add more variety!',
    'Excellent password! 💪',
  ];

  function setCriterion(el, pass) {
    el.classList.toggle('pass', pass);
    const icon = el.querySelector('i');
    icon.className = pass ? 'bi bi-check-circle-fill' : 'bi bi-circle';
  }

  function analyze() {
    const pw = pwInput.value;
    const score = getScore(pw);
    const entropy = calcEntropy(pw);
    const cs = charsetSize(pw);

    // Strength fill
    pwFill.className = 'dv-strength-fill ' + (pw ? classes[score] : 'str-none');

    // Label + color
    pwLabel.textContent = pw ? labels[score] : 'Start typing...';
    pwLabel.style.color = pw ? colors[score] : '';

    // Entropy badge
    pwEntropy.textContent = pw ? `~${entropy} bits` : '';

    // Criteria
    setCriterion(criteria.len,   pw.length >= 8);
    setCriterion(criteria.upper, /[A-Z]/.test(pw));
    setCriterion(criteria.lower, /[a-z]/.test(pw));
    setCriterion(criteria.num,   /\d/.test(pw));
    setCriterion(criteria.sym,   /[^a-zA-Z0-9]/.test(pw));
    setCriterion(criteria.long,  pw.length >= 16);

    // Stats
    stats.len.textContent     = pw.length;
    stats.entropy.textContent = entropy;
    stats.charset.textContent = cs;
    stats.score.textContent   = score + '/5';

    // Suggestions
    if (pw && score < 5) {
      suggestions.textContent = '💡 ' + tips[Math.min(score, tips.length - 1)];
      suggestions.classList.add('visible');
    } else {
      suggestions.classList.remove('visible');
    }

    copyBtn.disabled = !pw;
  }

  // Show/hide password
  pwToggle.addEventListener('click', () => {
    const show = pwInput.type === 'password';
    pwInput.type = show ? 'text' : 'password';
    pwEye.className = show ? 'bi bi-eye-slash' : 'bi bi-eye';
    pwInput.focus();
  });

  // Generate strong password
  function generatePassword(len = 20) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}';
    let pw = '';
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    arr.forEach(b => pw += charset[b % charset.length]);
    // Ensure all character types present
    pw = pw.slice(0, -4)
      + 'Aa1!'.split('').map((c, i) => charset[Math.floor(Math.random() * charset.length / 4) + i * charset.length / 4] || c).join('');
    return pw;
  }

  generateBtn.addEventListener('click', () => {
    pwInput.type = 'text';
    pwEye.className = 'bi bi-eye-slash';
    pwInput.value = generatePassword();
    analyze();
  });

  copyBtn.addEventListener('click', () => {
    if (!pwInput.value) return;
    navigator.clipboard.writeText(pwInput.value).then(() => {
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = orig, 2000);
    });
  });

  pwInput.addEventListener('input', analyze);
  analyze();
})();
