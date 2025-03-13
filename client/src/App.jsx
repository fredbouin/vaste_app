// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TimelinePage from './pages/timeline/TimelinePage';
import PricingPage from './pages/pricing/PricingPage';
import PriceSheetPage from './pages/pricing/PriceSheetPage';
import SettingsPage from './pages/settings/SettingsPage';
import MainLayout from './components/layout/MainLayout';
import Footer from './components/Footer';
import './styles/main.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <main className="flex-grow">
          <MainLayout>
            <Routes>
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/price-sheet" element={<PriceSheetPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/" element={<Navigate to="/timeline" replace />} />
            </Routes>
          </MainLayout>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;