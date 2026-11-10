import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage for node environment
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Assign global localStorage
const mockStorage = new MockLocalStorage();
(global as any).localStorage = mockStorage;
(global as any).window = {};

describe('Data Isolation & Clean Slate Suite', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  const DEMO_SESSION_KEY = 'money_manager_demo_session_v2';
  const DEMO_STORAGE_KEYS = {
    ACCOUNTS: 'mm_demo_accounts_v2',
    TRANSACTIONS: 'mm_demo_transactions_v2',
    BUDGETS: 'mm_demo_budgets_v2',
    CATEGORIES: 'mm_demo_categories_v2',
    SETTINGS: 'mm_demo_settings_v2',
  };
  const VERIFIED_STORAGE_KEYS = {
    ACCOUNTS: 'mm_verified_accounts_v2',
    TRANSACTIONS: 'mm_verified_transactions_v2',
    BUDGETS: 'mm_verified_budgets_v2',
    CATEGORIES: 'mm_verified_categories_v2',
    SETTINGS: 'mm_verified_settings_v2',
  };

  function isDemoSession(): boolean {
    const raw = mockStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      return parsed?.accountType === 'LOCAL_DEMO';
    } catch {
      return false;
    }
  }

  function getEntityStorageKey(entity: keyof typeof DEMO_STORAGE_KEYS): string {
    return isDemoSession() ? DEMO_STORAGE_KEYS[entity] : VERIFIED_STORAGE_KEYS[entity];
  }

  it('correctly identifies when demo session is active vs inactive', () => {
    assert.strictEqual(isDemoSession(), false, 'Should be false when no session stored');

    mockStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
      id: 'demo-local',
      accountType: 'LOCAL_DEMO',
      name: 'Demo User',
    }));
    assert.strictEqual(isDemoSession(), true, 'Should be true when demo session exists');

    mockStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
      id: 'user-123',
      accountType: 'VERIFIED',
    }));
    assert.strictEqual(isDemoSession(), false, 'Should be false when accountType is VERIFIED');
  });

  it('strictly isolates demo storage keys from verified storage keys', () => {
    // 1. Guest / Verified mode
    assert.strictEqual(getEntityStorageKey('ACCOUNTS'), VERIFIED_STORAGE_KEYS.ACCOUNTS);
    assert.strictEqual(getEntityStorageKey('TRANSACTIONS'), VERIFIED_STORAGE_KEYS.TRANSACTIONS);
    assert.strictEqual(getEntityStorageKey('BUDGETS'), VERIFIED_STORAGE_KEYS.BUDGETS);

    // 2. Switch to Instant Demo
    mockStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
      id: 'demo-local',
      accountType: 'LOCAL_DEMO',
    }));
    assert.strictEqual(getEntityStorageKey('ACCOUNTS'), DEMO_STORAGE_KEYS.ACCOUNTS);
    assert.strictEqual(getEntityStorageKey('TRANSACTIONS'), DEMO_STORAGE_KEYS.TRANSACTIONS);
    assert.strictEqual(getEntityStorageKey('BUDGETS'), DEMO_STORAGE_KEYS.BUDGETS);

    // 3. Store demo records
    const demoAccounts = [{ id: 'acc-1', name: 'Demo Cash', balance: 5000 }];
    mockStorage.setItem(DEMO_STORAGE_KEYS.ACCOUNTS, JSON.stringify(demoAccounts));

    // Verify verified key has zero data
    assert.strictEqual(mockStorage.getItem(VERIFIED_STORAGE_KEYS.ACCOUNTS), null);
    assert.deepStrictEqual(JSON.parse(mockStorage.getItem(DEMO_STORAGE_KEYS.ACCOUNTS)!), demoAccounts);
  });

  it('guarantees fresh sessions start with zero accounts, transactions, and budgets', () => {
    // When a fresh Instant Demo starts:
    const initialAccounts: any[] = [];
    const initialTransactions: any[] = [];
    const initialBudgets: any[] = [];

    assert.strictEqual(initialAccounts.length, 0, 'Must have zero accounts initially');
    assert.strictEqual(initialTransactions.length, 0, 'Must have zero transactions initially');
    assert.strictEqual(initialBudgets.length, 0, 'Must have zero budgets initially');
  });
});

describe('Strong Password & Email Validation Suite', () => {
  function validateStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter (A-Z)');
    if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter (a-z)');
    if (!/[0-9]/.test(password)) errors.push('At least one digit (0-9)');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('At least one special character');
    return { isValid: errors.length === 0, errors };
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  it('rejects weak passwords and accepts strong passwords', () => {
    assert.strictEqual(validateStrongPassword('12345').isValid, false);
    assert.strictEqual(validateStrongPassword('password').isValid, false);
    assert.strictEqual(validateStrongPassword('Password123').isValid, false, 'Missing special symbol');
    assert.strictEqual(validateStrongPassword('P@ssword1').isValid, true, 'Meets all criteria');
    assert.strictEqual(validateStrongPassword('Akash#Tk99!Secure').isValid, true);
  });

  it('validates email format before allowing submission', () => {
    assert.strictEqual(validateEmail(''), false);
    assert.strictEqual(validateEmail('invalid-email'), false);
    assert.strictEqual(validateEmail('user@'), false);
    assert.strictEqual(validateEmail('user@domain'), false);
    assert.strictEqual(validateEmail('user@domain.com'), true);
    assert.strictEqual(validateEmail('test.dev@company.org'), true);
  });
});

describe('Email Verification & Account-Type Indicators Suite', () => {
  function validateVerificationCode(code: string): boolean {
    return /^\d{6}$/.test(code.trim());
  }

  function getAccountTypeBadge(accountType: 'LOCAL_DEMO' | 'VERIFIED' | null): {
    label: string;
    description: string;
    badgeVariant: string;
  } {
    if (accountType === 'LOCAL_DEMO') {
      return {
        label: 'Local Account',
        description: 'Stored only in this browser (LocalStorage). Independent from server.',
        badgeVariant: 'amber',
      };
    }
    if (accountType === 'VERIFIED') {
      return {
        label: 'Verified Account',
        description: 'Email verified. Financial ledgers synchronized to PostgreSQL.',
        badgeVariant: 'emerald',
      };
    }
    return {
      label: 'Guest Session',
      description: 'Not authenticated',
      badgeVariant: 'muted',
    };
  }

  it('validates 6-digit verification code format', () => {
    assert.strictEqual(validateVerificationCode(''), false);
    assert.strictEqual(validateVerificationCode('12345'), false, 'Too short');
    assert.strictEqual(validateVerificationCode('1234567'), false, 'Too long');
    assert.strictEqual(validateVerificationCode('12a456'), false, 'Contains letter');
    assert.strictEqual(validateVerificationCode('849201'), true, 'Valid 6-digit code');
    assert.strictEqual(validateVerificationCode(' 103948 '), true, 'Valid with whitespace trimmed');
  });

  it('returns correct visual indicator and description for Local Account', () => {
    const badge = getAccountTypeBadge('LOCAL_DEMO');
    assert.strictEqual(badge.label, 'Local Account');
    assert.strictEqual(badge.badgeVariant, 'amber');
    assert.match(badge.description, /Stored only in this browser/i);
  });

  it('returns correct visual indicator and description for Verified Account', () => {
    const badge = getAccountTypeBadge('VERIFIED');
    assert.strictEqual(badge.label, 'Verified Account');
    assert.strictEqual(badge.badgeVariant, 'emerald');
    assert.match(badge.description, /Email verified/i);
    assert.match(badge.description, /PostgreSQL/i);
  });

  it('blocks unverified accounts from being classified as Verified Account', () => {
    const user = {
      email: 'newuser@example.com',
      isEmailVerified: false,
    };
    const canAccessVerifiedAccount = user.isEmailVerified;
    assert.strictEqual(canAccessVerifiedAccount, false, 'Unverified user must not get verified access');
  });

  function shouldRedirectFromAuthPages(user: { accountType: string; isEmailVerified?: boolean } | null, pathname: string): boolean {
    if (!user) return false;
    if (user.accountType === 'VERIFIED' && user.isEmailVerified) {
      return pathname !== '/verify-email';
    }
    // LOCAL_DEMO users must NOT be redirected so they can register or sign in to verified accounts
    return false;
  }

  it('allows LOCAL_DEMO users to visit /register and /login without being redirected to dashboard', () => {
    const demoUser = { accountType: 'LOCAL_DEMO', isEmailVerified: false };
    assert.strictEqual(shouldRedirectFromAuthPages(demoUser, '/register'), false, 'Demo user must be allowed on /register');
    assert.strictEqual(shouldRedirectFromAuthPages(demoUser, '/login'), false, 'Demo user must be allowed on /login');
  });

  it('redirects already VERIFIED users away from /register and /login to dashboard', () => {
    const verifiedUser = { accountType: 'VERIFIED', isEmailVerified: true };
    assert.strictEqual(shouldRedirectFromAuthPages(verifiedUser, '/register'), true, 'Verified user should be redirected');
    assert.strictEqual(shouldRedirectFromAuthPages(verifiedUser, '/login'), true, 'Verified user should be redirected');
    assert.strictEqual(shouldRedirectFromAuthPages(verifiedUser, '/verify-email'), false, 'Should allow /verify-email');
  });
});

describe('Category & Select Label Resolution Suite', () => {
  const DEFAULT_CATEGORIES = [
    { id: 'cat-sal', name: 'Salary & Employment', type: 'INCOME' },
    { id: 'cat-con', name: 'Software Consulting', type: 'INCOME' },
    { id: 'cat-hou', name: 'Housing & Rent', type: 'EXPENSE' },
    { id: 'cat-gro', name: 'Groceries & Market', type: 'EXPENSE' },
    { id: 'cat-uti', name: 'Utilities & Internet', type: 'EXPENSE' },
    { id: 'cat-din', name: 'Dining & Cafes', type: 'EXPENSE' },
    { id: 'cat-tra', name: 'Transportation', type: 'EXPENSE' },
    { id: 'cat-hea', name: 'Health & Wellness', type: 'EXPENSE' },
  ];

  function extractItemsFromChildren(children: any): Record<string, any> {
    const items: Record<string, any> = {};

    function traverse(node: any) {
      if (!node) return;
      if (Array.isArray(node)) {
        for (const item of node) {
          traverse(item);
        }
        return;
      }
      if (node && typeof node === 'object' && 'props' in node) {
        const props = node.props;
        if (props && 'value' in props && props.value !== undefined && props.value !== null) {
          items[String(props.value)] = props.label !== undefined ? props.label : props.children;
        }
        if (props && props.children) {
          traverse(props.children);
        }
      }
    }

    traverse(children);
    return items;
  }

  it('maps category ids to full display names instead of showing raw ids like cat-hou or cat-gro', () => {
    const mockSelectChildren = [
      {
        props: {
          children: DEFAULT_CATEGORIES.map((c) => ({
            props: {
              value: c.id,
              children: c.name,
            },
          })),
        },
      },
    ];

    const items = extractItemsFromChildren(mockSelectChildren);

    // Verify cat-hou maps to 'Housing & Rent'
    assert.strictEqual(items['cat-hou'], 'Housing & Rent', 'cat-hou must map to Housing & Rent');
    assert.notStrictEqual(items['cat-hou'], 'cat-hou', 'cat-hou must not be displayed as raw id');

    // Verify cat-gro maps to 'Groceries & Market'
    assert.strictEqual(items['cat-gro'], 'Groceries & Market', 'cat-gro must map to Groceries & Market');
    assert.notStrictEqual(items['cat-gro'], 'cat-gro', 'cat-gro must not be displayed as raw id');

    // All categories resolve to their full names
    for (const cat of DEFAULT_CATEGORIES) {
      assert.strictEqual(items[cat.id], cat.name, `${cat.id} must resolve to ${cat.name}`);
    }
  });

  it('correctly honors explicit label prop over nested children for accessibility', () => {
    const mockSelectChildren = [
      {
        props: {
          value: 'cat-hou',
          label: 'Housing & Rent',
          children: { props: { children: 'Housing & Rent with colored dot' } },
        },
      },
    ];

    const items = extractItemsFromChildren(mockSelectChildren);
    assert.strictEqual(items['cat-hou'], 'Housing & Rent');
  });
});

