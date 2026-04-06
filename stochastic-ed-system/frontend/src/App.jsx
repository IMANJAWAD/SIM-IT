import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomAlert from './components/CustomAlert';
import { Landing, Login, Signup, Dashboard, About, JacksonNetwork, NonHomogeneousPoissonProcess } from './pages';
import JacksonResult from './pages/jackson-result';
import NHPPResults from './pages/nhpp-results.jsx';
import PriorityQueuing from './pages/PriorityQueuing';
import PriorityQueueResults from './pages/priorityqueue-results';
import SensitivityAnalysis from './pages/SensitivityAnalysis';

import './App.css';

// Layout wrapper for pages that need navbar and footer
const Layout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <>
      {showNavbar && <Navbar />}
      <main>{children}</main>
      {showFooter && <Footer />}
    </>
  );
};

// Animated routes wrapper
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <Layout>
              <Landing />
            </Layout>
          }
        />

        {/* Auth Pages - No footer */}
        <Route
          path="/login"
          element={
            <Layout showNavbar={true} showFooter={false}>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/signup"
          element={
            <Layout showNavbar={true} showFooter={false}>
              <Signup />
            </Layout>
          }
        />

        {/* Dashboard - With navbar for consistency */}
        <Route
          path="/dashboard"
          element={
            <Layout showNavbar={true} showFooter={true}>
              <Dashboard />
            </Layout>
          }
        />

        {/* About Page */}
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />

        {/* Jackson Network Page */}
        <Route
          path="/jackson-network"
          element={
            <Layout>
              <JacksonNetwork />
            </Layout>
          }
        />

        {/* Jackson Results Page */}
        <Route
          path="/jackson-results"
          element={
            <Layout>
              <JacksonResult />
            </Layout>
          }
        />

        {/* Non-Homogeneous Poisson Process Page */}
        <Route
          path="/poisson-process"
          element={
            <Layout>
              <NonHomogeneousPoissonProcess />
            </Layout>
          }
        />

        {/* NHPP Results Page */}
        <Route
          path="/nhpp-results"
          element={
            <Layout>
              <NHPPResults />
            </Layout>
          }
        />

        {/* Priority Queuing Page */}
        <Route
          path="/priority-queuing"
          element={
            <Layout>
              <PriorityQueuing />
            </Layout>
          }
        />

        {/* Priority Queue Results Page */}
        <Route
          path="/priorityqueue-results"
          element={
            <Layout>
              <PriorityQueueResults />
            </Layout>
          }
        />

        <Route
          path="/sensitivity-analysis"
          element={
            <Layout>
              <SensitivityAnalysis />
            </Layout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="pf-app-shell">
        <AnimatedRoutes />
        <CustomAlert />
      </div>
    </Router>
  );
}

export default App;
