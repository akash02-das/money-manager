export interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 - 100
  criteriaMet: number; // 0 - 5
  criteria: PasswordCriteria;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  isStrong: boolean;
}

export const SPECIAL_CHARACTERS = '!@#$%^&*()_+-=[]{};\':"|,.<>/?~`';

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const criteria: PasswordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password),
  };

  const criteriaMet = Object.values(criteria).filter(Boolean).length;

  let score = 0;
  let label: PasswordStrengthResult['label'] = 'Very Weak';
  let color = 'bg-rose-500';

  if (!password) {
    score = 0;
    label = 'Very Weak';
    color = 'bg-muted';
  } else if (criteriaMet <= 1) {
    score = 20;
    label = 'Very Weak';
    color = 'bg-rose-500';
  } else if (criteriaMet === 2) {
    score = 40;
    label = 'Weak';
    color = 'bg-orange-500';
  } else if (criteriaMet === 3) {
    score = 60;
    label = 'Fair';
    color = 'bg-amber-500';
  } else if (criteriaMet === 4) {
    score = 80;
    label = 'Good';
    color = 'bg-blue-500';
  } else {
    // All 5 criteria met
    score = password.length >= 12 ? 100 : 90;
    label = 'Strong';
    color = 'bg-emerald-500';
  }

  // Strictly consider strong only when all 5 criteria are fulfilled
  const isStrong = criteriaMet === 5 && password.length >= 8;

  return {
    score,
    criteriaMet,
    criteria,
    label,
    color,
    isStrong,
  };
}

/**
 * Generates a cryptographically strong, friendly-to-read password
 * guaranteed to fulfill:
 * - 12-14 characters
 * - Uppercase, lowercase, number, special character
 */
export function generateStrongPassword(): string {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // excluded easily confused I, O
  const lowers = 'abcdefghijkmnopqrstuvwxyz'; // excluded easily confused l
  const numbers = '23456789'; // excluded 0, 1
  const symbols = '!@#$%&*?';

  // Seed with at least 2 of each required character group
  const sample = (charset: string, count: number) => {
    let result = '';
    const array = new Uint32Array(count);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < count; i++) {
        result += charset[array[i] % charset.length];
      }
    } else {
      for (let i = 0; i < count; i++) {
        result += charset[Math.floor(Math.random() * charset.length)];
      }
    }
    return result;
  };

  const pool = [
    sample(uppers, 3),
    sample(lowers, 4),
    sample(numbers, 3),
    sample(symbols, 2),
  ].join('');

  // Shuffle thoroughly using Fisher-Yates
  const characters = pool.split('');
  for (let i = characters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }

  return characters.join('');
}

