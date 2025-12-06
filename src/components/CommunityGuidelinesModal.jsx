import { useEffect } from 'react';
import './CommunityGuidelinesModal.css';

const CommunityGuidelinesModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="guidelines-modal-overlay" onClick={onClose}>
      <div className="guidelines-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="guidelines-modal-close" onClick={onClose}>×</button>
        
        <h2 className="guidelines-title">Community Guidelines</h2>
        <p className="guidelines-subtitle">
          Help us create a safe, fun, and respectful environment for everyone
        </p>
        
        <div className="guidelines-body">
          <div className="guidelines-section">
            <h3 className="section-title">
              <span className="section-icon">🏆</span>
              Be Respectful
            </h3>
            <p>Treat all members with respect. No harassment, hate speech, bullying, or discrimination of any kind. Celebrate diversity and be inclusive.</p>
          </div>
          
          <div className="guidelines-section">
            <h3 className="section-title">
              <span className="section-icon">🎬</span>
              Content Standards
            </h3>
            <ul className="guidelines-list">
              <li><span className="list-bullet">✓</span> All videos must be original content created by you</li>
              <li><span className="list-bullet">✓</span> No copyrighted material without permission</li>
              <li><span className="list-bullet">✓</span> Content must be appropriate for all ages</li>
              <li><span className="list-bullet">✓</span> No explicit, violent, or dangerous content</li>
              <li><span className="list-bullet">✓</span> Respect Kenyan culture and traditions</li>
            </ul>
          </div>
          
          <div className="guidelines-section">
            <h3 className="section-title">
              <span className="section-icon">👍</span>
              Fair Voting
            </h3>
            <ul className="guidelines-list">
              <li><span className="list-bullet">✓</span> No vote manipulation or cheating</li>
              <li><span className="list-bullet">✓</span> One vote per entry per day per user</li>
              <li><span className="list-bullet">✓</span> No creating multiple accounts to vote</li>
              <li><span className="list-bullet">✓</span> Vote based on content quality, not personal relationships</li>
              <li><span className="list-bullet">✓</span> Encourage fair competition and sportsmanship</li>
            </ul>
          </div>
          
          <div className="guidelines-section">
            <h3 className="section-title">
              <span className="section-icon">💬</span>
              Constructive Comments
            </h3>
            <p>Comments should be constructive, encouraging, and relevant to the content. No spam, self-promotion, or irrelevant links. Help build each other up!</p>
            <ul className="guidelines-list">
              <li><span className="list-bullet">✓</span> Be positive and supportive</li>
              <li><span className="list-bullet">✓</span> Offer constructive feedback</li>
              <li><span className="list-bullet">✓</span> No hate comments or negativity</li>
            </ul>
          </div>
          
          <div className="guidelines-section">
            <h3 className="section-title">
              <span className="section-icon">⚠️</span>
              Safety & Privacy
            </h3>
            <ul className="guidelines-list">
              <li><span className="list-bullet">✓</span> Protect your personal information</li>
              <li><span className="list-bullet">✓</span> Don't share others' personal information</li>
              <li><span className="list-bullet">✓</span> Report suspicious activity immediately</li>
              <li><span className="list-bullet">✓</span> Be mindful of your digital footprint</li>
            </ul>
          </div>
          
          <div className="guidelines-section">
            <h3 className="section-title">
              <span className="section-icon">📢</span>
              Reporting & Moderation
            </h3>
            <p>Help us keep the platform safe by reporting violations:</p>
            <ul className="guidelines-list">
              <li><span className="list-bullet">✓</span> Use the report button on any concerning content</li>
              <li><span className="list-bullet">✓</span> Our moderators review reports within 24 hours</li>
              <li><span className="list-bullet">✓</span> Provide specific details when reporting</li>
              <li><span className="list-bullet">✓</span> False reports may result in penalties</li>
            </ul>
          </div>
          
          <div className="guidelines-section consequences-section">
            <h3 className="section-title">
              <span className="section-icon">⚖️</span>
              Consequences for Violations
            </h3>
            <div className="consequences-grid">
              <div className="consequence-level">
                <h4>First Offense</h4>
                <p>Warning & content removal</p>
              </div>
              <div className="consequence-level">
                <h4>Second Offense</h4>
                <p>Temporary suspension (7 days)</p>
              </div>
              <div className="consequence-level">
                <h4>Third Offense</h4>
                <p>Permanent account ban</p>
              </div>
            </div>
            <p className="note">Serious violations (hate speech, threats, etc.) may result in immediate permanent ban.</p>
          </div>
          
          <div className="guidelines-final-note">
            <h3 className="section-title">
              <span className="section-icon">🇰🇪</span>
              Our Kenyan Community Spirit
            </h3>
            <p>Let's work together to showcase Kenya's incredible talent, creativity, and positive energy. Remember: Ubuntu – "I am because we are."</p>
          </div>
        </div>
        
        <div className="guidelines-footer">
          <button className="guidelines-agree-button" onClick={onClose}>
            <span className="button-icon">✅</span>
            I Understand and Agree to Follow These Guidelines
          </button>
          <p className="guidelines-agreement-note">
            By clicking "I Understand and Agree", you acknowledge that you have read, understood, and agree to abide by these community guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelinesModal;