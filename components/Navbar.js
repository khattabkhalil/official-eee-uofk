'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { theme, language, isAdmin, toggleTheme, toggleLanguage, logout, t } = useApp();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('الرئيسية', 'Home') },
    { href: '/subjects', label: t('المواد', 'Subjects') },
    { href: '/announcements', label: t('الإعلانات', 'Announcements') },
    { href: '/questions', label: t('الأسئلة', 'Questions') },
    { href: '/statistics', label: t('الإحصائيات', 'Statistics') },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo & Toggle */}
          <div className="flex justify-between w-full md:w-auto items-center">
            <Link href="/" className="navbar-logo">
              <div className="logo-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                  <path d="M8 12h16M8 16h16M8 20h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="logo-text">
                <div className="logo-title">{t('جامعة الخرطوم', 'University of Khartoum')}</div>
                <div className="logo-subtitle">{t('قسم الهندسة الكهربائية والإلكترونية', 'EEE Department')}</div>
              </div>
              {/* Mobile: Show abbreviated text if space is tight? Or just icon? handled by CSS */}
            </Link>

            {/* Mobile Menu Button */}
            <button className="mobile-toggle icon-btn" onClick={toggleMenu}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Links & Actions */}
          <div className={`navbar-main ${isMenuOpen ? 'open' : ''}`}>
            <div className="navbar-links">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`navbar-link ${isActive(link.href) ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="navbar-actions">
              <button onClick={toggleLanguage} className="icon-btn" title={t('English', 'العربية')}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" />
                </svg>
              </button>

              <button onClick={toggleTheme} className="icon-btn" title={t('الوضع الداكن', 'Dark Mode')}>
                {theme === 'light' ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {isAdmin ? (
                <>
                  <Link href="/admin" className="btn btn-primary btn-sm" onClick={() => setIsMenuOpen(false)}>
                    {t('لوحة التحكم', 'Dashboard')}
                  </Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="btn btn-secondary btn-sm">
                    {t('تسجيل الخروج', 'Logout')}
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm" onClick={() => setIsMenuOpen(false)}>
                  {t('تسجيل الدخول', 'Admin Login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow-sm);
        }

        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          gap: 2rem;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          transition: transform var(--transition-fast);
        }

        .navbar-logo:hover {
          transform: scale(1.02);
        }

        .logo-icon {
          flex-shrink: 0;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.2;
        }

        .navbar-main {
           display: flex; /* Default for desktop */
           align-items: center;
           gap: 2rem;
           flex: 1;
           justify-content: space-between;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar-link {
          padding: 0.5rem 1rem;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          position: relative;
        }

        .navbar-link:hover {
          color: var(--primary-600);
          background: var(--bg-secondary);
        }

        .navbar-link.active {
          color: var(--primary-600);
          font-weight: 600;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .icon-btn:hover {
          background: var(--bg-tertiary);
          color: var(--primary-600);
        }
        
        .mobile-toggle {
          display: none; /* Hidden by default on desktop */
        }

        @media (max-width: 768px) {
           .mobile-toggle {
             display: flex; /* Show on mobile */
           }

           .navbar-content {
             flex-direction: column;
             align-items: flex-start;
             gap: 0;
           }

           .logo-text {
             font-size: 0.9em;
           }

           .navbar-main {
             display: none; /* Hidden by default on mobile */
             width: 100%;
             flex-direction: column;
             align-items: stretch;
             gap: 1rem;
             padding-top: 1rem;
             border-top: 1px solid var(--border-color);
             margin-top: 1rem;
           }

           .navbar-main.open {
             display: flex; /* Show when open on mobile */
           }
           
           .navbar-links {
             flex-direction: column;
             width: 100%;
           }

           .navbar-link {
             width: 100%;
             text-align: center;
           }
           
           .navbar-actions {
             justify-content: center;
             width: 100%;
             padding-top: 0.5rem;
             border-top: 1px solid var(--border-color);
           }
        }
      `}</style>
    </nav>
  );
}
