import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  useEffect(() => {
    // Add scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
        }
      });
    }, observerOptions);

    const cards = document.querySelectorAll('.feature-card, .hero-visual');
    cards.forEach(card => observer.observe(card));

    return () => {
      cards.forEach(card => observer.unobserve(card));
    };
  }, []);

  // Hero Illustration SVG
  const HeroIllustration = () => (
    <svg width="600" height="500" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-illustration">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbd6ea" />
          <stop offset="100%" stopColor="#c7b5f3" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c7b5f3" />
          <stop offset="100%" stopColor="#b03fae" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="300" cy="250" r="180" fill="url(#grad1)" opacity="0.3" className="hero-circle-1"/>
      <circle cx="450" cy="150" r="120" fill="url(#grad2)" opacity="0.2" className="hero-circle-2"/>
      
      {/* Main task board illustration */}
      <g className="hero-board" transform="translate(150, 100)">
        {/* Board */}
        <rect x="0" y="0" width="300" height="280" rx="20" fill="white" stroke="url(#grad2)" strokeWidth="3" opacity="0.95" className="board-shadow"/>
        <rect x="15" y="15" width="270" height="250" rx="15" fill="white"/>
        
        {/* Header */}
        <rect x="15" y="15" width="270" height="50" rx="15" fill="url(#grad1)"/>
        <text x="150" y="45" textAnchor="middle" fill="#5a2a6e" fontSize="20" fontWeight="bold" fontFamily="Poppins">My Tasks</text>
        
        {/* Task items */}
        <g transform="translate(30, 80)">
          <rect x="0" y="0" width="240" height="35" rx="8" fill="#f7eef8" stroke="#efc7e5" strokeWidth="1.5"/>
          <circle cx="20" cy="17.5" r="8" fill="#b03fae" opacity="0.3"/>
          <text x="35" y="22" fill="#5a2a6e" fontSize="14" fontFamily="Poppins">Complete project proposal</text>
          <rect x="0" y="45" width="240" height="35" rx="8" fill="#ffffff" stroke="#efe2f3" strokeWidth="1.5"/>
          <circle cx="20" cy="62.5" r="8" fill="none" stroke="#c7b5f3" strokeWidth="2"/>
          <text x="35" y="67" fill="#53406a" fontSize="14" fontFamily="Poppins">Review team feedback</text>
          <rect x="0" y="90" width="240" height="35" rx="8" fill="#ffffff" stroke="#efe2f3" strokeWidth="1.5"/>
          <circle cx="20" cy="107.5" r="8" fill="none" stroke="#c7b5f3" strokeWidth="2"/>
          <text x="35" y="112" fill="#53406a" fontSize="14" fontFamily="Poppins">Schedule meeting</text>
        </g>
        
        {/* Add button */}
        <rect x="30" y="220" width="240" height="40" rx="10" fill="url(#grad1)" className="add-button"/>
        <text x="150" y="245" textAnchor="middle" fill="#5a2a6e" fontSize="16" fontWeight="600" fontFamily="Poppins">+ Add New Task</text>
      </g>
      
      {/* Floating elements */}
      <circle cx="100" cy="400" r="25" fill="url(#grad1)" opacity="0.6" className="floating-1"/>
      <circle cx="500" cy="350" r="20" fill="url(#grad2)" opacity="0.5" className="floating-2"/>
      <circle cx="80" cy="100" r="15" fill="#fbd6ea" opacity="0.4" className="floating-3"/>
    </svg>
  );

  // Feature Illustrations with circular icon
  const FeatureIcon = ({ icon, gradient }) => (
    <div className="feature-icon-svg feature-icon-circular">
      <div className="feature-icon-circle">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <defs>
            <linearGradient id={`iconGrad${icon}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
          {icon === 'check' && (
            <path d="M18 30 L26 38 L42 22" stroke={`url(#iconGrad${icon})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          )}
          {icon === 'list' && (
            <g>
              <rect x="16" y="18" width="28" height="3" rx="1.5" fill={`url(#iconGrad${icon})`}/>
              <rect x="16" y="27" width="28" height="3" rx="1.5" fill={`url(#iconGrad${icon})`}/>
              <rect x="16" y="36" width="22" height="3" rx="1.5" fill={`url(#iconGrad${icon})`}/>
            </g>
          )}
          {icon === 'bolt' && (
            <path d="M22 18 L33 27 L28 30 L38 42 L27 33 L32 30 L22 18" fill={`url(#iconGrad${icon})`}/>
          )}
          {icon === 'lock' && (
            <g>
              <rect x="21" y="24" width="18" height="18" rx="3" fill="none" stroke={`url(#iconGrad${icon})`} strokeWidth="2.5"/>
              <path d="M24 24 L24 19 Q24 16 27 16 L33 16 Q36 16 36 19 L36 24" fill="none" stroke={`url(#iconGrad${icon})`} strokeWidth="2.5"/>
            </g>
          )}
        </svg>
      </div>
    </div>
  );

  const features = [
    {
      icon: 'check',
      gradient: ['#fbd6ea', '#c7b5f3'],
      title: 'Simple & Intuitive',
      description: 'Clean interface designed for easy task management. Add, complete, and organize your todos effortlessly.'
    },
    {
      icon: 'list',
      gradient: ['#c7b5f3', '#fbd6ea'],
      title: 'Stay Organized',
      description: 'Keep track of all your tasks in one place. Never forget an important task again.'
    },
    {
      icon: 'bolt',
      gradient: ['#fbd6ea', '#efc7e5'],
      title: 'Boost Productivity',
      description: 'Focus on what matters most. Complete your tasks efficiently and achieve your goals faster.'
    },
    {
      icon: 'lock',
      gradient: ['#c7b5f3', '#b03fae'],
      title: 'Secure & Private',
      description: 'Your data is protected with secure authentication. Your tasks remain private and accessible only to you.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="nav-logo">✓</span>
            <span className="nav-title">TodoList</span>
          </div>
          <button 
            className="nav-hamburger-btn"
            onClick={() => setNavMenuOpen(!navMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className={`nav-actions ${navMenuOpen ? 'open' : ''}`}>
            <button className="nav-btn-secondary" onClick={() => { setIsLoginOpen(true); setNavMenuOpen(false); }}>Sign In</button>
            <button className="nav-btn-primary" onClick={() => { setIsRegisterOpen(true); setNavMenuOpen(false); }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Decorative background elements */}
      <div className="landing-bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <header className="landing-header">
        <div className="landing-container hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span>✨ Organize Your Life</span>
            </div>
            <h1 className="landing-title">
              Your Personal
              <span className="gradient-text"> Todo List</span>
            </h1>
            <p className="landing-subtitle">
              Stay organized, boost productivity, and accomplish your goals with our intuitive task management app. 
              Simple, elegant, and designed to help you succeed.
            </p>
            <div className="landing-cta">
              <button className="cta-primary" onClick={() => setIsRegisterOpen(true)}>
                <span>Get Started Free</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="cta-secondary" onClick={() => setIsLoginOpen(true)}>
                Sign In
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Free</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">✓</div>
                <div className="stat-label">Secure</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">⚡</div>
                <div className="stat-label">Fast</div>
              </div>
            </div>
          </div>
          <div className="hero-visual-wrapper hero-visual">
            <HeroIllustration />
          </div>
        </div>
      </header>

      <section className="landing-features">
        <div className="landing-container">
          <div className="section-header">
            <h2 className="features-title">Why Choose Our Todo App?</h2>
            <p className="features-subtitle">Everything you need to stay productive and organized</p>
          </div>
          {/* Desktop Grid */}
          <div className="features-grid features-grid-desktop">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <FeatureIcon icon={feature.icon} gradient={feature.gradient} />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
          {/* Mobile Swiper Carousel */}
          <div className="features-swiper-container">
            <Swiper
              modules={[Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="features-swiper"
            >
              {features.map((feature, index) => (
                <SwiperSlide key={index}>
                  <div className="feature-card feature-card-mobile">
                    <FeatureIcon icon={feature.icon} gradient={feature.gradient} />
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="nav-logo">✓</span>
              <span className="nav-title">TodoList</span>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>
            <p className="footer-copyright">© 2024 TodoList. Built with ❤️ for productivity.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setTimeout(() => setIsRegisterOpen(true), 300);
        }}
        onSuccess={() => {
          window.location.reload();
        }}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setTimeout(() => setIsLoginOpen(true), 300);
        }}
        onSuccess={() => {
          // Registration success is handled in the modal
        }}
      />
    </div>
  );
}

