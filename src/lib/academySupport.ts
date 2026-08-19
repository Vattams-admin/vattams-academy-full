export type SupportPriority = 'low' | 'normal' | 'high' | 'urgent';

export type SupportCategory =
  | 'login'
  | 'course'
  | 'classroom'
  | 'assignment'
  | 'test'
  | 'competition'
  | 'certificate'
  | 'payment'
  | 'notification'
  | 'technical'
  | 'other';

export type SupportDraft = {
  category: SupportCategory;
  priority: SupportPriority;
  subject: string;
  description: string;
};

const DRAFT_KEY = 'vattams_academy_support_draft';

export function saveSupportDraft(draft: SupportDraft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadSupportDraft(): SupportDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSupportDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

export function createSupportReference() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VATTAMS-${date}-${random}`;
}

export function getSupportContext() {
  return {
    url: window.location.href,
    route: window.location.hash || '#/home',
    online: navigator.onLine,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
}
