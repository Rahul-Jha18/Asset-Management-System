import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignIn = () => {
    setMenuOpen(false);
    navigate('/login');
  };

  const handleSignUp = () => {
    setMenuOpen(false);
    navigate('/register');
  };
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };
  const hideNavMenu = ['/login', '/register'].includes(location.pathname);
  const showNewsBar = location.pathname === '/';

  return (
    <>
      <header className="global-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">

          {/* LOGO – LEFT */}
          <div className="brand">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <img
                src="https://play-lh.googleusercontent.com/zW5KMgLpmTvg0TA4xYIztb5HedXa6mqbAflXHBnNWix5kKetiqtR1ZOqNghuBtleiJkN"
                className="logo"
                alt="NLI Logo"
              />
            </Link>
          </div>
          {/* HAMBURGER (MOBILE) */}
          {!hideNavMenu && (
            <div className="hamburger-menu" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </div>
          )}

          {/* NAV LINKS */}
          {!hideNavMenu && (
            <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
              <Link to="/branches" onClick={() => setMenuOpen(false)}>Branch</Link>
              <Link to="/assets" onClick={() => setMenuOpen(false)}>Asset List</Link>
              <Link to="/requests" onClick={() => setMenuOpen(false)}>Requests</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Help</Link>

              {/* MOBILE AUTH */}
              <div className="mobile-nav-actions">
                {user ? (
                  <>
                    <span className="user">Hi, {user.name || user.email}</span>
                    <button className="sign" onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <button className="sign" onClick={handleSignIn}>Sign in</button>
                    <button className="sign" onClick={handleSignUp}>Sign up</button>
                  </>
                )}
              </div>
            </nav>
          )}

          {/* DESKTOP AUTH – RIGHT */}
          <div className="nav-right">
            {user ? (
              <>
                <span className="user">Hi, {user.name || user.email}</span>
                <button className="sign" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="sign" onClick={handleSignIn}>Sign in</button>
                <button className="sign" onClick={handleSignUp}>Sign up</button>
              </>
            )}
          </div>

        </div>
      </header>

      {showNewsBar && (
        <div className="news-bar">
          <div className="news-ticker">
            <span>
              <strong>News & Updates:</strong>{' '}
              <b>Latest Update is about our system new features that is now the user or sub-admin can Request their assets issue and change status if need any.
              </b>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
