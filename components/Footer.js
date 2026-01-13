'use client';

import { useApp } from '@/contexts/AppContext';

export default function Footer() {
    const { t } = useApp();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title">{t('جامعة الخرطوم', 'University of Khartoum')}</h3>
                        <p className="footer-description">
                            {t(
                                'قسم الهندسة الكهربائية والإلكترونية - منصة إدارة المحتوى الأكاديمي للفصل الدراسي الأول',
                                'Electrical and Electronic Engineering Department - Academic Management Platform for Semester 1'
                            )}
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-subtitle">{t('روابط سريعة', 'Quick Links')}</h4>
                        <ul className="footer-links">
                            <li><a href="/">{t('الرئيسية', 'Home')}</a></li>
                            <li><a href="/subjects">{t('المواد', 'Subjects')}</a></li>
                            <li><a href="/announcements">{t('الإعلانات', 'Announcements')}</a></li>
                            <li><a href="/questions">{t('الأسئلة', 'Questions')}</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-subtitle">{t('المواد الدراسية', 'Subjects')}</h4>
                        <ul className="footer-links">
                            <li>{t('الحسبان I', 'Calculus I')}</li>
                            <li>{t('الجبر الخطي', 'Linear Algebra')}</li>
                            <li>{t('الفيزياء I', 'Physics I')}</li>
                            <li>{t('برمجة الحاسوب', 'Computer Programming')}</li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-subtitle">{t('تواصل معنا', 'Contact Us')}</h4>
                        <p className="footer-contact">
                            {t('جامعة الخرطوم، الخرطوم، السودان', 'University of Khartoum, Khartoum, Sudan')}
                        </p>
                        <p className="footer-contact">
                            Email: eee@uofk.edu.sd
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        © {currentYear} {t('جامعة الخرطوم - قسم الهندسة الكهربائية والإلكترونية. جميع الحقوق محفوظة.',
                            'University of Khartoum - EEE Department. All rights reserved.')}
                    </p>
                </div>
            </div>

            <style jsx>{`
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          margin-top: 4rem;
          padding: 3rem 0 1.5rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .footer-subtitle {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .footer-description,
        .footer-contact {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-links li {
          font-size: 0.875rem;
        }

        .footer-links a {
          color: var(--text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-links a:hover {
          color: var(--primary-600);
        }

        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }

        .footer-bottom p {
          font-size: 0.875rem;
          color: var(--text-tertiary);
          margin: 0;
        }

        @media (max-width: 768px) {
          .footer {
            padding: 2rem 0 1rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
        </footer>
    );
}
