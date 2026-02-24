import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Landing, Login, Signup, Dashboard, About } from './pages';

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
            <Layout showNavbar={false} showFooter={false}>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/signup"
          element={
            <Layout showNavbar={false} showFooter={false}>
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
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#caf0f8]">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
