import React from "react";
import { Music, Globe, Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-top-grid">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-brand">
            <div className="footer-brand-icon">
              <Music size={18} color="#fff" />
            </div>
            <span className="footer-brand-title">Sonix</span>
          </div>
          <p className="footer-tagline">
            Next-generation music streaming experience with high-definition
            audio and synchronized lyrics.
          </p>
        </div>

        {/* Links Columns */}
        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#about" onClick={(e) => e.preventDefault()}>
                  About
                </a>
              </li>
              <li>
                <a href="#jobs" onClick={(e) => e.preventDefault()}>
                  Careers
                </a>
              </li>
              <li>
                <a href="#press" onClick={(e) => e.preventDefault()}>
                  Press & News
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Communities</h4>
            <ul>
              <li>
                <a href="#artists" onClick={(e) => e.preventDefault()}>
                  For Artists
                </a>
              </li>
              <li>
                <a href="#developers" onClick={(e) => e.preventDefault()}>
                  Developers
                </a>
              </li>
              <li>
                <a href="#advertising" onClick={(e) => e.preventDefault()}>
                  Advertising
                </a>
              </li>
              <li>
                <a href="#investors" onClick={(e) => e.preventDefault()}>
                  Investors
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Useful Links</h4>
            <ul>
              <li>
                <a href="#support" onClick={(e) => e.preventDefault()}>
                  Support
                </a>
              </li>
              <li>
                <a href="#player" onClick={(e) => e.preventDefault()}>
                  Web Player
                </a>
              </li>
              <li>
                <a href="#mobile" onClick={(e) => e.preventDefault()}>
                  Free Mobile App
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider" />

      {/* Bottom Legal & Copyright */}
      <div className="footer-bottom-row">
        <div className="footer-legal-links">
          <a href="#legal" onClick={(e) => e.preventDefault()}>
            Legal
          </a>
          <a href="#privacy" onClick={(e) => e.preventDefault()}>
            Privacy Center
          </a>
          <a href="#policy" onClick={(e) => e.preventDefault()}>
            Privacy Policy
          </a>
          <a href="#cookies" onClick={(e) => e.preventDefault()}>
            Cookies
          </a>
          <a href="#about-ads" onClick={(e) => e.preventDefault()}>
            About Ads
          </a>
          <a href="#accessibility" onClick={(e) => e.preventDefault()}>
            Accessibility
          </a>
        </div>

        <div className="footer-copyright-text">
          <span>© 2026 Sonix Music Streaming Inc. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
