/**
 * Disposable & temporary email domain blocklist.
 * Prevents disposable accounts and fake throwaway sign-ups.
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamail.org',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'sharklasers.com',
  'trashmail.com',
  'trashmail.net',
  'dispostable.com',
  'fakeinbox.com',
  'generator.email',
  'burnermail.io',
  'mohmal.com',
  'crazymailing.com',
  'mytemp.email',
  'inboxkitten.com',
  'dropmail.me',
  'getairmail.com',
  'fakemailgenerator.com',
  'emailondeck.com',
  'mintemail.com',
  'nada.ltd',
  'getnada.com',
  'tempail.com',
  'mytempemail.com',
  'maildrop.cc',
  'harakirimail.com',
  'mytempmail.com',
]);

/**
 * Common provider typo mapping to help users catch mistakes
 */
const DOMAIN_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'iclud.com': 'icloud.com',
  'iclou.com': 'icloud.com',
};

export interface EmailValidationResult {
  isValidSyntax: boolean;
  isDisposable: boolean;
  domain: string;
  suggestedDomain?: string;
  suggestedEmail?: string;
  errorMessage?: string;
  isRealCandidate: boolean;
}

/**
 * Validates whether an email appears to be real, non-disposable, and well-formed.
 */
export function validateEmailAddress(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return {
      isValidSyntax: false,
      isDisposable: false,
      domain: '',
      isRealCandidate: false,
      errorMessage: 'Please enter your email address.',
    };
  }

  // RFC-compliant practical regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const hasValidSyntax = emailRegex.test(trimmed);

  if (!hasValidSyntax) {
    return {
      isValidSyntax: false,
      isDisposable: false,
      domain: '',
      isRealCandidate: false,
      errorMessage: 'Please enter a valid email format (e.g. name@domain.com).',
    };
  }

  const parts = trimmed.split('@');
  const localPart = parts[0];
  const domain = parts[1] || '';

  // Check top-level domain length (must be at least 2 letters, e.g. .co, .io, .com)
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/i.test(tld)) {
    return {
      isValidSyntax: false,
      isDisposable: false,
      domain,
      isRealCandidate: false,
      errorMessage: 'The domain extension (.something) is invalid.',
    };
  }

  // Check if disposable
  const isDisposable = DISPOSABLE_EMAIL_DOMAINS.has(domain);
  if (isDisposable) {
    return {
      isValidSyntax: true,
      isDisposable: true,
      domain,
      isRealCandidate: false,
      errorMessage:
        'Disposable/throwaway email addresses are blocked to protect your financial history. Please use your permanent email.',
    };
  }

  // Check for common typo suggestions
  const suggestedDomain = DOMAIN_TYPOS[domain];
  const suggestedEmail = suggestedDomain
    ? `${localPart}@${suggestedDomain}`
    : undefined;

  return {
    isValidSyntax: true,
    isDisposable: false,
    domain,
    suggestedDomain,
    suggestedEmail,
    isRealCandidate: true,
  };
}

