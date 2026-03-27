import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import ApplyPage from "./pages/ApplyPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import EnquiryPage from "./pages/EnquiryPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import IncubateesPage from "./pages/IncubateesPage.jsx";
import IncubateeProfilePage from "./pages/IncubateeProfilePage.jsx";
import IncubiteeFormPage from "./pages/IncubiteeFormPage.jsx";
import LeadershipPage from "./pages/LeadershipPage.jsx";
import MediaCoveragePage from "./pages/MediaCoveragePage.jsx";
import MembershipFormPage from "./pages/MembershipFormPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import MentorsPage from "./pages/MentorsPage.jsx";
import NewsEventsPage from "./pages/NewsEventsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";
import RefundPolicyPage from "./pages/RefundPolicyPage.jsx";
import RifServicesPage from "./pages/RifServicesPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import TermsConditionsPage from "./pages/TermsConditionsPage.jsx";
import TestimonialsPage from "./pages/TestimonialsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route element={<HomePage />} path="/" />
        <Route element={<AboutPage />} path="/about" />
        <Route element={<LeadershipPage />} path="/leadership" />
        <Route element={<ContactPage />} path="/contact" />
        <Route element={<TeamPage sectionKey="coreTeam" />} path="/team" />
        <Route element={<TeamPage sectionKey="boardOfDirectors" />} path="/leadership/board-of-directors" />
        <Route element={<TeamPage sectionKey="advisoryBoard" />} path="/leadership/advisory-board" />
        <Route element={<TeamPage sectionKey="boardOfDirectors" />} path="/team/board-of-directors" />
        <Route element={<TeamPage sectionKey="advisoryBoard" />} path="/team/advisory-board" />
        <Route element={<TeamPage sectionKey="coreTeam" />} path="/team/core-team" />
        <Route element={<IncubateesPage />} path="/incubatees" />
        <Route element={<IncubateeProfilePage />} path="/incubatees/:incubateeId" />
        <Route element={<MentorsPage />} path="/mentors" />
        <Route element={<ServicesPage />} path="/services" />
        <Route element={<MembershipPage />} path="/membership-plans" />
        <Route element={<RifServicesPage />} path="/rif-services" />
        <Route element={<NewsEventsPage />} path="/news-events" />
        <Route element={<GalleryPage />} path="/gallery" />
        <Route element={<MediaCoveragePage />} path="/media-coverage" />
        <Route element={<DocumentsPage />} path="/documents" />
        <Route element={<TestimonialsPage />} path="/testimonials" />
        <Route element={<PrivacyPolicyPage />} path="/privacy-policy" />
        <Route element={<TermsConditionsPage />} path="/terms-and-conditions" />
        <Route element={<RefundPolicyPage />} path="/refund-policy" />
        <Route element={<ApplyPage />} path="/apply" />
        <Route element={<EnquiryPage />} path="/enquiry" />
        <Route element={<MembershipFormPage />} path="/membership-register" />
        <Route element={<IncubiteeFormPage />} path="/incubatee-register" />
        <Route element={<AdminDashboardPage />} path="/admin" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  );
}
