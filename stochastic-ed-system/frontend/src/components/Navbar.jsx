import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import logoSp from '../assets/logo-sp.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('pulseflowAuth') === 'true' || localStorage.getItem('simitAuth') === 'true';

  const beforeLoginLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Login', path: '/login' },
    { name: 'Signup', path: '/signup' },
  ];

  const afterLoginLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Jackson Model', path: '/jackson-network' },
    { name: 'Poisson Process', path: '/poisson-process' },
    { name: 'Priority Queuing', path: '/priority-queuing' },
    { name: 'About', path: '/about' },
  ];

  const navLinks = isAuthenticated ? afterLoginLinks : beforeLoginLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-[#003049]/90 backdrop-blur-xl shadow-[0_8px_28px_rgba(0,48,73,0.25)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logoSp} alt="PulseFlow Logo" className="w-10 h-10 rounded-xl object-contain bg-white p-1.5 shadow-sm" />
            <div className="leading-tight">
              <span className="block text-base font-bold text-white">PulseFlow</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[#669BBC]">ED Stochastic Ops</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-4 py-2 text-sm font-semibold transition-colors rounded-full"
              >
                <span className={isActive(link.path) ? 'text-white' : 'text-[#669BBC] hover:text-white'}>
                  {link.name}
                </span>
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-[#C1121F] to-[#AE1F23] rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#003049] border-t border-white/10"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-gradient-to-r from-[#C1121F] to-[#AE1F23] text-white'
                      : 'text-[#669BBC] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
