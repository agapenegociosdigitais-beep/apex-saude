/**
 * APEX Saúde — Security Module
 * Implementações de segurança frontend
 *
 * 1. Hash de Senhas (crypto-js AES)
 * 2. XSS Protection (sanitização HTML)
 * 3. Session Timeout (15 min inatividade)
 * 4. Validação de Senha Forte
 */

// ════════════════════════════════════════════════════════════════
// 1. HASH DE SENHAS — Usar crypto-js
// ════════════════════════════════════════════════════════════════

/**
 * Hash de senha com SHA-256
 * @param {string} password - Senha em plaintext
 * @returns {string} - Hash SHA-256
 */
function hashPassword(password) {
  if (!password) return '';
  // Usar CryptoJS (loaded via CDN)
  return CryptoJS.SHA256(password).toString();
}

/**
 * Verificar se a senha confere com o hash
 * @param {string} inputPassword - Senha inserida
 * @param {string} hashedPassword - Hash armazenado
 * @returns {boolean} - True se confere
 */
function verifyPassword(inputPassword, hashedPassword) {
  return hashPassword(inputPassword) === hashedPassword;
}

// ════════════════════════════════════════════════════════════════
// 2. XSS PROTECTION — Sanitizar HTML
// ════════════════════════════════════════════════════════════════

/**
 * Escape HTML para prevenir XSS
 * @param {string} str - String com possível HTML malicioso
 * @returns {string} - String escapada
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };

  return str.replace(/[&<>"'\/]/g, char => map[char]);
}

/**
 * Sanitizar user input antes de guardar
 * Remove tags perigosas mas mantém texto
 * @param {string} input - Input do usuário
 * @returns {string} - Input sanitizado
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  // Remove scripts, iframes, etc
  const dangerous = /<script|<iframe|<embed|<object|on\w+\s*=/gi;
  if (dangerous.test(input)) {
    console.warn('🚨 Tentativa de XSS detectada:', input);
    return '';
  }

  return input.trim();
}

/**
 * Set text content seguro (previne XSS mesmo com innerHTML)
 * @param {HTMLElement} element - Elemento DOM
 * @param {string} text - Texto para exibir
 */
function safeTextContent(element, text) {
  if (!element) return;
  element.textContent = text; // Usar textContent é seguro
}

/**
 * Set HTML content com sanitização
 * Usar só quando realmente necessário
 * @param {HTMLElement} element - Elemento DOM
 * @param {string} html - HTML para exibir
 */
function safeInnerHTML(element, html) {
  if (!element) return;
  // Escape tudo first
  element.textContent = '';
  element.innerHTML = escapeHTML(html);
}

// ════════════════════════════════════════════════════════════════
// 3. SESSION TIMEOUT — Logout após inatividade
// ════════════════════════════════════════════════════════════════

let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos

/**
 * Reset inactivity timer
 * Chama logout se usuário ficar inativo
 */
function resetInactivityTimer() {
  // Clear timer anterior
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  // Se não está logged in, não fazer nada
  const currentUser = localStorage.getItem('apex_current_user');
  if (!currentUser) return;

  // Novo timer
  inactivityTimer = setTimeout(() => {
    logoutDueToInactivity();
  }, INACTIVITY_TIMEOUT);
}

/**
 * Logout por inatividade
 */
function logoutDueToInactivity() {
  console.warn('⏰ Sessão expirada por inatividade (15 minutos)');

  // Limpar session
  localStorage.removeItem('apex_current_user');
  localStorage.removeItem('apex_session_token');
  localStorage.removeItem('apex_session_start');

  // Mostrar mensagem
  alert('Sua sessão expirou por inatividade. Faça login novamente.');

  // Redirecionar
  window.location.href = 'apex-landing.html?msg=session-expired';
}

/**
 * Ativar monitor de inatividade
 * Chamar logo após login bem-sucedido
 */
function initializeInactivityMonitor() {
  // Eventos que resetam o timer
  const events = [
    'mousedown', 'mousemove', 'keypress',
    'scroll', 'touchstart', 'click'
  ];

  events.forEach(eventName => {
    document.addEventListener(eventName, resetInactivityTimer, true);
  });

  // Primeiro timer
  resetInactivityTimer();
}

/**
 * Parar monitor de inatividade
 * Chamar no logout
 */
function stopInactivityMonitor() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  const events = [
    'mousedown', 'mousemove', 'keypress',
    'scroll', 'touchstart', 'click'
  ];

  events.forEach(eventName => {
    document.removeEventListener(eventName, resetInactivityTimer, true);
  });
}

// ════════════════════════════════════════════════════════════════
// 4. VALIDAÇÃO DE SENHA FORTE
// ════════════════════════════════════════════════════════════════

/**
 * Validar força da senha
 * Requer:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial (opcional para força básica)
 *
 * @param {string} password - Senha a validar
 * @returns {object} - { valid: boolean, score: number, message: string, rules: object }
 */
function validatePasswordStrength(password) {
  const rules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noSpaces: !/\s/.test(password)
  };

  // Contar quantas regras passou
  const passedRules = Object.values(rules).filter(Boolean).length;

  // Score de 0-6
  let score = passedRules;
  let strength = 'Fraca';
  let color = '#ef4444'; // red

  if (score <= 2) {
    strength = 'Muito fraca';
    color = '#c0392b';
  } else if (score <= 3) {
    strength = 'Fraca';
    color = '#ef4444';
  } else if (score <= 4) {
    strength = 'Média';
    color = '#f59e0b';
  } else if (score <= 5) {
    strength = 'Boa';
    color = '#3b82f6';
  } else {
    strength = 'Muito boa';
    color = '#10b981';
  }

  // Requer pelo menos 4 regras (score >= 4 = Média ou melhor)
  const valid = (
    rules.minLength &&
    rules.hasUppercase &&
    rules.hasLowercase &&
    rules.hasNumber &&
    rules.noSpaces
  );

  return {
    valid,
    score,
    strength,
    color,
    rules,
    message: valid
      ? `✓ Senha ${strength.toLowerCase()}`
      : `✗ Senha ${strength.toLowerCase()} - Adicione maiúsculas, números e caracteres especiais`
  };
}

/**
 * Mostrar feedback de força de senha em tempo real
 * @param {HTMLInputElement} inputElement - Input de senha
 * @param {HTMLElement} feedbackElement - Elemento para mostrar feedback
 */
function attachPasswordStrengthFeedback(inputElement, feedbackElement) {
  if (!inputElement || !feedbackElement) return;

  inputElement.addEventListener('input', () => {
    const result = validatePasswordStrength(inputElement.value);

    feedbackElement.style.display = inputElement.value ? 'block' : 'none';
    feedbackElement.style.color = result.color;
    feedbackElement.textContent = result.message;
    feedbackElement.style.fontSize = '12px';
    feedbackElement.style.marginTop = '5px';
    feedbackElement.style.fontFamily = "'DM Mono', monospace";
  });
}

// ════════════════════════════════════════════════════════════════
// 5. SAFE USER OBJECT — Usar ao guardar/carregar users
// ════════════════════════════════════════════════════════════════

/**
 * Criar usuário seguro (hash de senha)
 * @param {object} userData - { email, password, nome, municipio, plano }
 * @returns {object} - Usuário com senha hashada
 */
function createSecureUser(userData) {
  return {
    id: Date.now().toString(),
    email: sanitizeInput(userData.email),
    nome: sanitizeInput(userData.nome),
    municipio: sanitizeInput(userData.municipio),
    plano: sanitizeInput(userData.plano),
    senha_hash: hashPassword(userData.password), // ← HASH, não plaintext
    criado_em: new Date().toISOString()
  };
}

/**
 * Validar login de forma segura
 * @param {string} email - Email do usuário
 * @param {string} password - Senha inserida
 * @returns {object|null} - Usuário se válido, null se não
 */
function validateLogin(email, password) {
  const users = JSON.parse(localStorage.getItem('apex_users') || '[]');
  const sanitizedEmail = sanitizeInput(email);

  const user = users.find(u => u.email === sanitizedEmail);
  if (!user) return null;

  // Verificar senha com hash
  if (!verifyPassword(password, user.senha_hash)) {
    return null;
  }

  // Retornar user SEM a senha
  const { senha_hash, ...safeUser } = user;
  return safeUser;
}

// ════════════════════════════════════════════════════════════════
// EXPORT para uso por outros scripts
// ════════════════════════════════════════════════════════════════

// Tornar funções globais (já que é vanilla JS)
window.Security = {
  // Hash
  hashPassword,
  verifyPassword,
  createSecureUser,
  validateLogin,

  // XSS
  escapeHTML,
  sanitizeInput,
  safeTextContent,
  safeInnerHTML,

  // Session
  resetInactivityTimer,
  logoutDueToInactivity,
  initializeInactivityMonitor,
  stopInactivityMonitor,

  // Validation
  validatePasswordStrength,
  attachPasswordStrengthFeedback
};

console.log('✅ Security module loaded successfully');
