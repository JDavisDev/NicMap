import React from 'react';
import './AgeVerification.css';

interface AgeVerificationProps {
  onVerified: () => void;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({ onVerified }) => {
  const handleYes = () => {
    localStorage.setItem('nicmap_age_verified', 'true');
    onVerified();
  };

  const handleNo = () => {
    window.location.href = 'https://www.samhsa.gov/find-help/national-helpline';
  };

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal">
        <h1>NicMap</h1>
        <div className="age-gate-icon">21+</div>
        <h2>Age Verification Required</h2>
        <p>
          This website contains information about nicotine products.
          You must be 21 years of age or older to enter.
        </p>

        <div className="age-gate-question">
          <p><strong>Are you 21 years of age or older?</strong></p>
          <div className="age-gate-buttons">
            <button className="btn-yes" onClick={handleYes}>
              Yes, I am 21+
            </button>
            <button className="btn-no" onClick={handleNo}>
              No, I am under 21
            </button>
          </div>
        </div>

        <div className="quit-resources">
          <h3>Need Help Quitting?</h3>
          <p>If you or someone you know is struggling with nicotine addiction, these resources can help:</p>
          <ul>
            <li>
              <a href="https://smokefree.gov" target="_blank" rel="noopener noreferrer">
                Smokefree.gov
              </a>
              <span> - Free resources, tools, and support</span>
            </li>
            <li>
              <a href="tel:1-800-784-8669">
                1-800-QUIT-NOW (1-800-784-8669)
              </a>
              <span> - Free counseling and support</span>
            </li>
            <li>
              <a href="https://www.thetruth.com/quit-vaping" target="_blank" rel="noopener noreferrer">
                This Is Quitting
              </a>
              <span> - Text-based quit program for young people</span>
            </li>
            <li>
              <a href="https://www.samhsa.gov/find-help/national-helpline" target="_blank" rel="noopener noreferrer">
                SAMHSA National Helpline
              </a>
              <span> - 1-800-662-4357 (24/7 support)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
