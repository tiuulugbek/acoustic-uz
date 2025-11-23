import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/AdminLayout';
import PostsPage from './pages/Posts';
import ServicesPage from './pages/Services';
import HomepagePage from './pages/Homepage';
import BannersPage from './pages/Banners';
import CatalogPage from './pages/Catalog';
import DoctorsPage from './pages/Doctors';
import PatientsPage from './pages/Patients';
import ChildrenHearingPage from './pages/ChildrenHearing';
import AboutPage from './pages/About';
import BranchesPage from './pages/Branches';
import BrandsPage from './pages/Brands';
import MenusPage from './pages/Menus';
import FAQPage from './pages/FAQ';
import SettingsPage from './pages/Settings';
import MediaPage from './pages/Media';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AdminLayout />}>
          <Route index element={<HomepagePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="children-hearing" element={<ChildrenHearingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="menus" element={<MenusPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

