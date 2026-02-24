import { Link } from 'react-router-dom';
import { Github, ExternalLink } from 'lucide-react';
import logoSp from '../assets/logo-sp.png';

export default function Footer() {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'About', path: '/about' },
    { name: 'Login', path: '/login' },
  ];

  const technologies = [
    'React',
    'TailwindCSS',
    'FastAPI',
    'SimPy',
    'NumPy',
    'SciPy',
  ];

  return (
    <footer className="bg-[#0077b6] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoSp} alt="SIMIT Logo" className="w-10 h-10 rounded-xl object-contain bg-white/20 p-1" />
              <span className="text-xl font-bold">SIMIT</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Simulation Intelligence & Modeling Interface Tool. 
              Advanced stochastic simulation platform for hospital 
              emergency department optimization using Poisson Process, 
              Markov Chains, and Monte Carlo methods.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/80 hover:text-[#f0f3bd] transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#f0f3bd]" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Technologies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-[#f0f3bd]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/70 text-sm">
              © 2026 SIMIT – Simulation Intelligence Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-[#f0f3bd] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-[#f0f3bd] transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
