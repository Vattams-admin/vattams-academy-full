import { RouterProvider, useRouter } from '@/lib/router';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Schema from '@/components/Schema';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Founder from '@/pages/Founder';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import TuitionHome from '@/pages/tuition/TuitionHome';
import TuitionCourses from '@/pages/tuition/TuitionCourses';
import TuitionCourseDetail from '@/pages/tuition/TuitionCourseDetail';
import TuitionBooking from '@/pages/tuition/TuitionBooking';
import TuitionTrialBooking from '@/pages/tuition/TuitionTrialBooking';
import TuitionTutorRegister from '@/components/tuition/tutor/TuitionTutorRegister';
import TuitionTutorLogin from '@/pages/tuition/TuitionTutorLogin';
import TuitionTutorDashboard from '@/pages/tuition/TuitionTutorDashboard';
import TuitionStudentClasses from '@/pages/tuition/student/TuitionStudentClasses';
import TuitionStudentLogin from '@/pages/tuition/TuitionStudentLogin';
import TuitionStudentDashboard from '@/pages/tuition/TuitionStudentDashboard';
import TuitionTutorClasses from '@/pages/tuition/tutor/TuitionTutorClasses';
import AcademyCompetitions from '@/pages/AcademyCompetitions';
import AcademyCertificates from '@/pages/AcademyCertificates';

function PageContent() {
  const { page } = useRouter();
  switch (page) {
    case 'home': return <Home />;
    case 'about': return <About />;
    case 'founder': return <Founder />;
    case 'contact': return <Contact />;
    case 'admin-login': return <AdminLogin />;
    case 'admin-dashboard': return <AdminDashboard />;
    case 'tuition-home': return <TuitionHome />;
    case 'tuition-courses': return <TuitionCourses />;
    case 'tuition-course-detail': return <TuitionCourseDetail />;
    case 'tuition-booking': return <TuitionBooking />;
    case 'tuition-trial-booking': return <TuitionTrialBooking />;
    case 'tuition-tutor-register': return <TuitionTutorRegister />;
    case 'tuition-tutor-login': return <TuitionTutorLogin />;
    case 'tuition-tutor-dashboard': return <TuitionTutorDashboard />;
    case 'tuition-student-login': return <TuitionStudentLogin />;
    case 'tuition-student-dashboard': return <TuitionStudentDashboard />;
    case 'tuition-student-classes': return <TuitionStudentClasses />;
    case 'tuition-tutor-classes': return <TuitionTutorClasses />;
    case 'academy-competitions': return <AcademyCompetitions />;
    case 'academy-certificates': return <AcademyCertificates />;
    default: return <NotFound />;
  }
}

function AppShell() {
  return <div className="min-h-screen flex flex-col"><Schema /><Header /><div className="flex-1"><PageContent /></div><Footer /></div>;
}

export default function App() {
  return <RouterProvider><AppShell /></RouterProvider>;
}
