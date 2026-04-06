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
    'Framer Motion',
    'Recharts',
    'Lucide',
  ];

  return (
    <footer className="bg-[#003049] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoSp} alt="PulseFlow Logo" className="w-10 h-10 rounded-xl object-contain bg-white p-1.5" />
              <span className="text-xl font-bold">PulseFlow</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              A Stochastic Optimization System for Emergency Departments.
              Operational simulation for queue pressure, triage dynamics,
              and real-time capacity planning.
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
                    className="text-white/80 hover:text-[#669BBC] transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#669BBC]" />
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
                  className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-[#669BBC]"
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
              © 2026 PulseFlow. Emergency simulation workspace.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-[#669BBC] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-[#669BBC] transition-colors"
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
