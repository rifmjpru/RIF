import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import ApplyPage from "./pages/ApplyPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import IncubateesPage from "./pages/IncubateesPage.jsx";
import IncubateeProfilePage from "./pages/IncubateeProfilePage.jsx";
import IncubiteeFormPage from "./pages/IncubiteeFormPage.jsx";
import MembershipFormPage from "./pages/MembershipFormPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import MentorsPage from "./pages/MentorsPage.jsx";
import NewsEventsPage from "./pages/NewsEventsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import RifServicesPage from "./pages/RifServicesPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route element={<HomePage />} path="/" />
        <Route element={<AboutPage />} path="/about" />
        <Route element={<ContactPage />} path="/contact" />
        <Route element={<TeamPage sectionKey="boardOfDirectors" />} path="/team" />
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
        <Route element={<DocumentsPage />} path="/documents" />
        <Route element={<ApplyPage />} path="/apply" />
        <Route element={<MembershipFormPage />} path="/membership-register" />
        <Route element={<IncubiteeFormPage />} path="/incubitee-register" />
        <Route element={<AdminDashboardPage />} path="/admin" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  );
}
