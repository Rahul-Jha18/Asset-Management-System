import React, { useEffect } from 'react';

export default function Footer() {
  useEffect(() => {
    const body = document.body;
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.minHeight = '100vh';

    const root = document.getElementById('root');
    if (root) root.style.flex = '1';
  }, []);

  return (
    <footer className="footer" style={{ marginTop: 'auto' }}>
      <div className="container footer-content">

        <div className="footer-about">
          <h4>Nepal Life Insurance</h4>
          <p>
            Centralized system to manage devices, branches, and organizational
            records efficiently.
          </p>
        </div>

        <div className="links">
          <div className="footer-links">
            <h5>Quick Links</h5>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/branches">Branches</a></li>
              <li><a href="/software">Software</a></li>
            </ul>
          </div>

          <div className="footer-social">
            <h5>Follow Us</h5>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank">Facebook</a>
              <a href="https://twitter.com" target="_blank">Twitter</a>
              <a href="https://linkedin.com" target="_blank">LinkedIn</a>
              <a href="https://instagram.com" target="_blank">Instagram</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} Project IMS — All rights reserved.</small>
      </div>
    </footer>
  );
}
