import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Marketing from './pages/Dashboard/Marketing';
import CRM from './pages/Dashboard/CRM';
import Stocks from './pages/Dashboard/Stocks';
import Profile from './pages/Profile';
import TaskKanban from './pages/Task/TaskKanban';
import TaskList from './pages/Task/TaskList';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Tables from './pages/Tables/Tables';
import FileManager from './pages/Pages/FileManager';
import DataTables from './pages/Pages/DataTables';
import PricingTables from './pages/Pages/PricingTables';
import ErrorPage from './pages/Pages/ErrorPage';
import MailSuccess from './pages/Pages/MailSuccess';
import Messages from './pages/Messages';
import Inbox from './pages/Inbox';
import Invoice from './pages/Invoice';
import BasicChart from './pages/Chart/BasicChart';
import AdvancedChart from './pages/Chart/AdvancedChart';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import ButtonsGroup from './pages/UiElements/ButtonsGroup';
import Badge from './pages/UiElements/Badge';
import Breadcrumbs from './pages/UiElements/Breadcrumbs';
import Cards from './pages/UiElements/Cards';
import Dropdowns from './pages/UiElements/Dropdowns';
import Modals from './pages/UiElements/Modals';
import Tabs from './pages/UiElements/Tabs';
import Tooltips from './pages/UiElements/Tooltips';
import Popovers from './pages/UiElements/Popovers';
import Accordion from './pages/UiElements/Accordion';
import Notifications from './pages/UiElements/Notifications';
import Pagination from './pages/UiElements/Pagination';
import Progress from './pages/UiElements/Progress';
import Carousel from './pages/UiElements/Carousel';
import Images from './pages/UiElements/Images';
import Videos from './pages/UiElements/Videos';
import ForgetPassword from './pages/Authentication/ForgotPassword';
import CLoader from './common/Loader';
import PageTitle from './components/PageTitle';
import ProFormElements from './pages/Form/ProFormElements';
import ProTables from './pages/Tables/ProTables';
import TermsConditions from './pages/Pages/TermsConditions';
import Faq from './pages/Pages/Faq';
import Teams from './pages/Pages/Teams';
import Avatars from './pages/UiElements/Avatars';
import List from './pages/UiElements/List';
import Spinners from './pages/UiElements/Spinners';
import ComingSoon from './pages/Authentication/ComingSoon';
import TwoStepVerification from './pages/Authentication/TwoStepVerification';
import UnderMaintenance from './pages/Authentication/UnderMaintenance';
import Classes from './pages/Dashboard/Classes';
import MessageBoard from './pages/Dashboard/MessageBoard';
import EmployerApplications from './pages/Dashboard/EmployerApplications';
import Chat from './pages/Dashboard/Chat/Chat';
import EmployerCandidates from './pages/Dashboard/EmployerCandidates';
import Events from './pages/Dashboard/Events';
import EmployerProfile from './pages/Profile/CompanyProfile';
import { analytics, auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import EmployerDashboard from './pages/Dashboard/EmployerDashboard';
import SchoolDashboard from './pages/Dashboard/SchoolDashboard';
import TextnotAllowed from './pages/Dashboard/TextnotAllowed';
import MyProfile from './pages/Profile/MyProfile';
import UploadJobData from './pages/Dashboard/UploadJobData';
import { useStateContext } from './context/useStateContext';
import CookiePolicy from './components/Legal/cookie-policy';
import TOS from './components/Legal/terms-and-conditions';
import PrivacyPolicy from './components/Legal/privacy-policy';
import { AuthWrapper } from './pages/Authentication/AuthWrapper';
import { logEvent } from 'firebase/analytics';
import { LocalStorageAuthUser } from './interfaces';
import SchoolEmployers from './pages/Dashboard/SchoolEmployers';
import SchoolStudents from './pages/Dashboard/SchoolStudents';
import SubscriptionPage from './pages/Payments/Subscription';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import SubscriptionSuccessPage from './pages/Payments/SubscriptionSuccessPage';
import SchoolProfile from './pages/Profile/SchoolProfile';
import SchoolTodo from './pages/Dashboard/SchoolTodo';
import Settings from './pages/Dashboard/EmployerSettings.js';
import ApplicantDetailsPage from './pages/Dashboard/ApplicantDetailsPage';
import ApplicantChatPage from './pages/Dashboard/Chat/ApplicantChatPage';
import InstitutionSettings from './pages/Dashboard/InstitutionSettings.js';
import TransferAccount from './pages/Dashboard/TransferAccount';
import DeleteAccount from './pages/Dashboard/DeleteAccount';
import CookieConsentBar from './pages/Cookies/CookieConsentBar.js';
import UploadBulkProgram from './pages/Dashboard/UploadBulkProgram.js';
import Jobs from './pages/Dashboard/Jobs.js'
import { useSelector } from 'react-redux';
import { RootState } from './store/store.js';
import { PusherClient } from './methods/pusher.js';
function App() {
  //////////////////////////////////////////////////// VARIABLES //////////////////////////////////////////////////////
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setPage } = useStateContext();
  const authUser: LocalStorageAuthUser = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useSelector((state: RootState) => state.user);
  //////////////////////////////////////////////////// USE EFFECT ///////////////////////////////////////////////////
  useEffect(() => {
    logEvent(analytics, 'impressions');
  }, []);
  useEffect(() => {
    if (user?.id) {
      (async () => {
        await PusherClient?.getInstance?.connect?.(user?.id);
      })();
    }
  }, [user]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (pathname.includes('institution')) {
      setPage('Institution');
    } else {
      setPage('Employer');
    }
  }, [pathname]);

  // useEffect(() => {
  //   onAuthStateChanged(auth, (user: any) => {
  //     if (user) {
  //       console.log('user got called in here');
  //       const userId = localStorage.getItem('userId');
  //       const userPromise = dispatch<any>(fetchUserById(userId));
  //       let employerOrPartnerPromise;

  //       if (page === 'Employer' && userId) {
  //         employerOrPartnerPromise = dispatch<any>(fetchEmployerById(userId));
  //       } else {
  //         employerOrPartnerPromise = userPromise.then(({ payload }) => {
  //           if (payload?.partnerId) {
  //             return dispatch<any>(fetchPartnerById(payload.partnerId));
  //           }
  //         });
  //       }

  //       Promise.all([userPromise, employerOrPartnerPromise])
  //         .then(() => {
  //           console.log('User and Employer/Partner data fetched');
  //         })
  //         .catch((error) => {
  //           console.error('Error fetching data:', error);
  //         });
  //     }
  //   });
  // }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user: any) => {
      if (!user) {
        if (
          !pathname.includes('signin') &&
          !pathname.includes('signup') &&
          !pathname.includes('forgot-password')
        ) {
          if (pathname.includes('employer')) {
            navigate('/employer/signin');
          } else if (pathname.includes('institution')) {
            navigate('/institution/signin');
          }
        }
      }
    });
  }, [pathname]);

  return loading ? (
    <CLoader />
  ) : (
    <>
      <Routes>
        <Route
          path="/institution/classes"
          element={
            <>
              <PageTitle title="Programs  | Evolo AI Portal" />
              <Classes />
            </>
          }
        />

        <Route
          path="/institution/settings"
          element={
            <>
              <PageTitle title="Settings  | Evolo AI Portal" />
              <InstitutionSettings />
            </>
          }
        />
        <Route
          path="/dashboard/TextnotAllowed"
          element={
            <>
              <PageTitle title="TextnotAllowed  | Evolo AI Portal" />
              <TextnotAllowed />
            </>
          }
        />
        <Route
          path="/dashboard/marketing"
          element={
            <>
              <PageTitle title="Marketing  | Evolo AI Portal" />
              <Marketing />
            </>
          }
        />
        {/* ///////////////////////////////// EMPLOYER //////////////////////////////////// */}
        <Route
          path="/employer/applications"
          element={
            <>
              <PageTitle title="Applications   | Evolo AI Portal" />
              <EmployerApplications />
            </>
          }
        />
        <Route
          path="/applicant/:id"
          element={
            <>
              <PageTitle title="Application Details   | Evolo AI Portal" />
              <ApplicantDetailsPage />
            </>
          }
        />
        <Route
          path="/chat/applicant/:id"
          element={
            <>
              <PageTitle title="Applicant Chat | Evolo AI Portal" />
              <ApplicantChatPage />
            </>
          }
        />

        <Route
          path="/employer/dashboard"
          element={
            <>
              <PageTitle title="EmployerDashboard  | Evolo AI Portal" />
              <EmployerDashboard />
            </>
          }
        />
        {/* Employer Chat */}
        <Route
          path="/employer/chat"
          element={
            <>
              <PageTitle title="EmployerChat  | Evolo AI Portal" />
              <Chat />
            </>
          }
        />
        {/* Employer Events */}
        <Route
          path="/employer/events"
          element={
            <>
              <PageTitle title="Events  | Evolo AI Portal" />
              <Events />
            </>
          }
        />
        {/* Employer Candidates */}
        <Route
          path="/employer/candidates"
          element={
            <>
              <PageTitle title="EmployerCandidates  | Evolo AI Portal" />
              <EmployerCandidates />
            </>
          }
        />
        {/* Employer Settings */}
        <Route
          path="/employer/settings"
          element={
            <>
              <PageTitle title="Settings  | Evolo AI Portal" />
              <Settings />
            </>
          }
        />
        {/* Recruiter Profile (Employer) */}
        <Route
          path="/recruiter/profile"
          element={
            <>
              <PageTitle title="Profile | Evolo AI Portal" />
              <MyProfile />
            </>
          }
        />
        {/* Employer Dashboard */}
        <Route
          path="/employer/companyprofile"
          element={
            <>
              <PageTitle title="Profile | Evolo AI Portal" />
              <EmployerProfile />
            </>
          }
        />
        {/* Employer Subscription */}
        <Route
          path="/employer/subscription"
          element={
            <>
              <PageTitle title="Subscription | Evolo AI Portal" />
              <SubscriptionPage />
            </>
          }
        />
        <Route
          path="/employer/subscription_success"
          element={
            <>
              <PageTitle title="Subscription success | Evolo AI Portal" />
              <SubscriptionSuccessPage />
            </>
          }
        />

        {/* ///////////////////////////////// ADMIN //////////////////////////////////// */}
        {/* Upload JobData */}
        <Route
          path="/employer/uploadjobdata"
          element={
            <>
              <PageTitle title="Profile | Evolo AI Portal" />
              <UploadJobData />
            </>
          }
        />
        <Route
          path="/employer/labour-market"
          element={
            <>
              <PageTitle title="program Upload | Evolo AI Portal" />
              <UploadBulkProgram />
            </>
          }
        />

        {/* ///////////////////////////////// SCHOOL //////////////////////////////////// */}
        {/* School Students */}
        <Route
          path="/institution/students"
          element={
            <>
              <PageTitle title="Students  | Evolo AI Portal" />
              <SchoolStudents />
            </>
          }
        />
        {/* Message Board */}
        <Route
          path="/institution/messageboard"
          element={
            <>
              <PageTitle title="Message  | Evolo AI Portal" />
              <MessageBoard />
            </>
          }
        />
        {/* School Dashboard */}
        <Route
          path="/institution/dashboard"
          element={
            <>
              <PageTitle title={`${authUser?.partnerName} | Evolo AI Portal`} />
              <SchoolDashboard />
            </>
          }
        />
        {/* School Employers */}
        <Route
          path="institution/employers"
          element={
            <>
              <PageTitle title="Employers  | Evolo AI Portal" />
              <SchoolEmployers />
            </>
          }
        />
        {/* School Events */}
        <Route
          path="/institution/events"
          element={
            <>
              <PageTitle title="Message  | Evolo AI Portal" />
              <Events />
            </>
          }
        />
        
        {/* School Todo */}
        <Route
          path="/institution/todo"
          element={
            <>
              <PageTitle title="Todo | Evolo AI Portal" />
              <SchoolTodo />
            </>
          }
        />
        {/* School Profile */}
        <Route
          path="/institution/schoolprofile"
          element={
            <>
              <PageTitle title="Instituition Profile | Evolo AI Portal" />
              <SchoolProfile />
            </>
          }
        />
        {/* Personal School Profile */}
        <Route
          path="/institution/myprofile"
          element={
            <>
              <PageTitle title="My Profile | Evolo AI Portal" />
              <MyProfile />
            </>
          }
        />

        <Route
          path="/dashboard/crm"
          element={
            <>
              <PageTitle title="CRM Dashboard | Evolo AI Portal" />
              <CRM />
            </>
          }
        />
        {/* School Chats */}
        <Route
          path="/institution/chat"
          element={
            <>
              <PageTitle title="Chats  | Evolo AI Portal" />
              <Chat />
            </>
          }
        />

        <Route
          path="/dashboard/stocks"
          element={
            <>
              <PageTitle title="Stocks  | Evolo AI Portal" />
              <Stocks />
            </>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Profile | Evolo AI Portal" />
              <Profile />
            </>
          }
        />
        <Route
          path="/tasks/task-list"
          element={
            <>
              <PageTitle title="Task List | Evolo AI Portal" />
              <TaskList />
            </>
          }
        />
        <Route
          path="/tasks/task-kanban"
          element={
            <>
              <PageTitle title="Task Kanban | Evolo AI Portal" />
              <TaskKanban />
            </>
          }
        />
        <Route
          path="/forms/form-elements"
          element={
            <>
              <PageTitle title="Form Elements | Evolo AI Portal" />
              <FormElements />
            </>
          }
        />
        <Route
          path="/forms/pro-form-elements"
          element={
            <>
              <PageTitle title="Pro Form Elements | Evolo AI Portal" />
              <ProFormElements />
            </>
          }
        />
        <Route
          path="/forms/form-layout"
          element={
            <>
              <PageTitle title="Form Layout | Evolo AI Portal" />
              <FormLayout />
            </>
          }
        />
        <Route
          path="/forms/pro-form-layout"
          element={
            <>
              <PageTitle title="Pro Form Layout | Evolo AI Portal" />
              {/* <CreateJob /> */}
            </>
          }
        />
        <Route
          path="/tables/tables"
          element={
            <>
              <PageTitle title="Tables | Evolo AI Portal" />
              <Tables />
            </>
          }
        />
        <Route
          path="/tables/pro-tables"
          element={
            <>
              <PageTitle title="Pro Tables | Evolo AI Portal" />
              <ProTables />
            </>
          }
        />
        <Route
          path="/tables/pro-tables"
          element={
            <>
              <PageTitle title="Tables | Evolo AI Portal" />
              <Tables />
            </>
          }
        />
        <Route
          path="/pages/file-manager"
          element={
            <>
              <PageTitle title="File Manager | Evolo AI Portal" />
              <FileManager />
            </>
          }
        />
        <Route
          path="/pages/data-tables"
          element={
            <>
              <PageTitle title="Data Tables | Evolo AI Portal" />
              <DataTables />
            </>
          }
        />
        <Route
          path="/pages/pricing-tables"
          element={
            <>
              <PageTitle title="Pricing Tables | Evolo AI Portal" />
              <PricingTables />
            </>
          }
        />
        <Route
          path="/pages/error-page"
          element={
            <>
              <PageTitle title="Error Page | Evolo AI Portal" />
              <ErrorPage />
            </>
          }
        />
        <Route
          path="/pages/faq"
          element={
            <>
              <PageTitle title="Faq's | Evolo AI Portal" />
              <Faq />
            </>
          }
        />
        <Route
          path="/pages/team"
          element={
            <>
              <PageTitle title="Terms & Conditions | Evolo AI Portal" />
              <Teams />
            </>
          }
        />
        <Route
          path="/pages/terms-conditions"
          element={
            <>
              <PageTitle title="Terms & Conditions | Evolo AI Portal" />
              <TermsConditions />
            </>
          }
        />
        <Route
          path="/pages/mail-success"
          element={
            <>
              <PageTitle title="Mail Success | Evolo AI Portal" />
              <MailSuccess />
            </>
          }
        />
        <Route
          path="/messages"
          element={
            <>
              <PageTitle title="Messages | Evolo AI Portal" />
              <Messages />
            </>
          }
        />
        <Route
          path="/inbox"
          element={
            <>
              <PageTitle title="Inbox | Evolo AI Portal" />
              <Inbox />
            </>
          }
        />
        <Route
          path="/invoice"
          element={
            <>
              <PageTitle title="Invoice | Evolo AI Portal" />
              <Invoice />
            </>
          }
        />
        <Route
          path="/chart/basic-chart"
          element={
            <>
              <PageTitle title="Basic Chart | Evolo AI Portal" />
              <BasicChart />
            </>
          }
        />
        <Route
          path="/chart/advanced-chart"
          element={
            <>
              <PageTitle title="Advanced Chart | Evolo AI Portal" />
              <AdvancedChart />
            </>
          }
        />
        <Route
          path="/ui/accordion"
          element={
            <>
              <PageTitle title="Accordion | Evolo AI Portal" />
              <Accordion />
            </>
          }
        />
        <Route
          path="/ui/alerts"
          element={
            <>
              <PageTitle title="Alerts | Evolo AI Portal" />
              <Alerts />
            </>
          }
        />
        <Route
          path="/ui/avatars"
          element={
            <>
              <PageTitle title="Avatars | Evolo AI Portal" />
              <Avatars />
            </>
          }
        />
        <Route
          path="/ui/badge"
          element={
            <>
              <PageTitle title="Badge | Evolo AI Portal" />
              <Badge />
            </>
          }
        />
        <Route
          path="/ui/breadcrumbs"
          element={
            <>
              <PageTitle title="Breadcrumbs | Evolo AI Portal" />
              <Breadcrumbs />
            </>
          }
        />
        <Route
          path="/ui/buttons"
          element={
            <>
              <PageTitle title="Buttons | Evolo AI Portal" />
              <Buttons />
            </>
          }
        />
        <Route
          path="/ui/buttons-group"
          element={
            <>
              <PageTitle title="Buttons Groupo | Evolo AI Portal" />
              <ButtonsGroup />
            </>
          }
        />
        <Route
          path="/ui/cards"
          element={
            <>
              <PageTitle title="Cards | Evolo AI Portal" />
              <Cards />
            </>
          }
        />
        <Route
          path="/ui/carousel"
          element={
            <>
              <PageTitle title="Carousel | Evolo AI Portal" />
              <Carousel />
            </>
          }
        />
        <Route
          path="/ui/dropdowns"
          element={
            <>
              <PageTitle title="Dropdowns | Evolo AI Portal" />
              <Dropdowns />
            </>
          }
        />
        <Route
          path="/ui/images"
          element={
            <>
              <PageTitle title="Images | Evolo AI Portal" />
              <Images />
            </>
          }
        />
        <Route
          path="/ui/list"
          element={
            <>
              <PageTitle title="List | Evolo AI Portal" />
              <List />
            </>
          }
        />
        <Route
          path="/ui/modals"
          element={
            <>
              <PageTitle title="Modals | Evolo AI Portal" />
              <Modals />
            </>
          }
        />
        <Route
          path="/ui/notifications"
          element={
            <>
              <PageTitle title="Notifications | Evolo AI Portal" />
              <Notifications />
            </>
          }
        />
        <Route
          path="/ui/pagination"
          element={
            <>
              <PageTitle title="Pagination | Evolo AI Portal" />
              <Pagination />
            </>
          }
        />
        <Route
          path="/ui/popovers"
          element={
            <>
              <PageTitle title="Popovers | Evolo AI Portal" />
              <Popovers />
            </>
          }
        />
        <Route
          path="/ui/progress"
          element={
            <>
              <PageTitle title="Progress | Evolo AI Portal" />
              <Progress />
            </>
          }
        />
        <Route
          path="/ui/spinners"
          element={
            <>
              <PageTitle title="Spinners | Evolo AI Portal" />
              <Spinners />
            </>
          }
        />
        <Route
          path="/ui/tabs"
          element={
            <>
              <PageTitle title="Tabs | Evolo AI Portal" />
              <Tabs />
            </>
          }
        />
        <Route
          path="/ui/tooltips"
          element={
            <>
              <PageTitle title="Tooltips | Evolo AI Portal" />
              <Tooltips />
            </>
          }
        />
        <Route
          path="/ui/videos"
          element={
            <>
              <PageTitle title="Videos | Evolo AI Portal" />
              <Videos />
            </>
          }
        />
        <Route
          path="/"
          element={
            <Jobs />
          }
        />
        <Route
          path="/employer/signup"
          element={
            <AuthWrapper>
              <PageTitle title="Signup | Evolo AI Portal" />
              <SignUp />
            </AuthWrapper>
          }
        />
        <Route
          path="/institution/signup"
          element={
            <AuthWrapper>
              <PageTitle title="Signup | Evolo AI Portal" />
              <SignUp />
            </AuthWrapper>
          }
        />
        <Route
          path="/employer/signin"
          element={
            <AuthWrapper>
              <PageTitle title="Signup | Evolo AI Portal" />
              <SignIn />
            </AuthWrapper>
          }
        />
        <Route
          path="/institution/signin"
          element={
            <AuthWrapper>
              <PageTitle title="Signup | Evolo AI Portal" />
              <SignIn />
            </AuthWrapper>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthWrapper>
              <PageTitle title="Reset Password | Evolo AI Portal" />
              <ForgetPassword />
            </AuthWrapper>
          }
        />
        <Route
          path="/auth/coming-soon"
          element={
            <>
              <PageTitle title="Coming Soon | Evolo AI Portal" />
              <ComingSoon />
            </>
          }
        />
        <Route
          path="/auth/two-step-verification"
          element={
            <>
              <PageTitle title="2 Step Verification | Evolo AI Portal" />
              <TwoStepVerification />
            </>
          }
        />
        <Route
          path="/auth/under-maintenance"
          element={
            <>
              <PageTitle title="Under Maintenance | Evolo AI Portal" />
              <UnderMaintenance />
            </>
          }
        />
        <Route
          path="/legal/cookie-policy"
          element={
            <>
              <PageTitle title="Under Maintenance | Evolo AI Portal" />
              <CookiePolicy />
            </>
          }
        />
        <Route
          path="/legal/terms-of-service"
          element={
            <>
              <PageTitle title="Under Maintenance | Evolo AI Portal" />
              <TOS />
            </>
          }
        />
        <Route
          path="/legal/legal/privacy-policy"
          element={
            <>
              <PageTitle title="Under Maintenance | Evolo AI Portal" />
              <PrivacyPolicy />
            </>
          }
        />

        <Route
          path="/employer/transfer-account"
          element={
            <>
              <PageTitle title="Transfer  | AdultEd Portal" />
              <TransferAccount />
            </>
          }
        />
        <Route
          path="/employer/delete-account"
          element={
            <>
              <PageTitle title="Delete  | AdultEd Portal" />
              <DeleteAccount />
            </>
          }
        />
      </Routes>
      <CookieConsentBar />
    </>
  );
}

export default App;
