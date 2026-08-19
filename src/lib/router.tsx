import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Page =
  | 'home'
  | 'about'
  | 'founder'
  | 'contact'
  | 'admin-login'
  | 'admin-dashboard'
  | 'tuition-home'
  | 'tuition-courses'
  | 'tuition-course-detail'
  | 'tuition-booking'
  | 'tuition-trial-booking'
  | 'tuition-tutor-register'
  | 'tuition-tutor-login'
  | 'tuition-tutor-dashboard'
  | 'tuition-student-login'
  | 'tuition-student-dashboard'
  | 'tuition-student-classes'
  | 'tuition-tutor-classes'
  | 'academy-competitions'
  | 'academy-certificates'
  | 'not-found';

const KNOWN_PAGES: Page[] = [
  'home', 'about', 'founder', 'contact', 'admin-login', 'admin-dashboard',
  'tuition-home', 'tuition-courses', 'tuition-course-detail', 'tuition-booking',
  'tuition-trial-booking', 'tuition-tutor-register', 'tuition-tutor-login', 'tuition-tutor-dashboard', 'tuition-student-login', 'tuition-student-dashboard', 'tuition-student-classes',
  'tuition-tutor-classes', 'academy-competitions', 'academy-certificates', 'not-found',
];

interface RouteState { page: Page; tuitionCourseSlug?: string; }
interface RouterContextValue extends RouteState { navigate: (page: Page, slug?: string) => void; }
const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function parseHash(rawHash: string): RouteState {
  let hash = rawHash.replace(/^#\/?/, '').trim();
  if (!hash) return { page: 'home' };
  try { hash = decodeURIComponent(hash); } catch { /* keep raw */ }
  if ((KNOWN_PAGES as string[]).includes(hash)) return { page: hash as Page };
  if (hash.startsWith('tuition-course-detail-')) {
    const slug = hash.slice('tuition-course-detail-'.length);
    return slug ? { page: 'tuition-course-detail', tuitionCourseSlug: slug } : { page: 'not-found' };
  }
  if (hash.startsWith('tuition-booking-')) {
    const slug = hash.slice('tuition-booking-'.length);
    return slug ? { page: 'tuition-booking', tuitionCourseSlug: slug } : { page: 'not-found' };
  }
  return { page: 'not-found' };
}

function buildHash(page: Page, slug?: string) {
  if ((page === 'tuition-course-detail' || page === 'tuition-booking') && slug) return `${page}-${slug}`;
  return page;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<RouteState>(() => typeof window !== 'undefined' ? parseHash(window.location.hash) : { page: 'home' });
  useEffect(() => {
    const handle = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
  }, []);
  const navigate = (page: Page, slug?: string) => {
    const next = buildHash(page, slug);
    if (window.location.hash.replace(/^#/, '') === next) setRoute(parseHash(next));
    else window.location.hash = next;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <RouterContext.Provider value={{ ...route, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within a RouterProvider');
  return ctx;
}
