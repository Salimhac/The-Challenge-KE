// pages/LegalPages.jsx
import { useParams } from 'react-router-dom';
import './LegalPages.css';

export default function LegalPages() {
  const { page } = useParams(); // terms, privacy, etc.
  
  const content = {
    'terms': {
      title: 'Terms of Service',
      content: `
        <h2>Terms of Service</h2>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using Kenya Campus Challenge, you accept and agree to be bound by these Terms of Service.</p>
        
        <h3>2. Eligibility</h3>
        <p>You must be at least 13 years old to use our platform. If you're under 18, you need parental consent.</p>
        
        <h3>3. User Accounts</h3>
        <p>You are responsible for maintaining the confidentiality of your account and password.</p>
        
        <h3>4. Content Submission</h3>
        <p>By submitting content, you grant us a license to display it on our platform. You retain ownership of your content.</p>
        
        <h3>5. Prohibited Content</h3>
        <p>Content that is illegal, harassing, hateful, or violates others' rights is prohibited.</p>
        
        <h3>6. Voting System</h3>
        <p>Each user gets one vote per entry per day. Attempting to manipulate votes will result in account suspension.</p>
        
        <h3>7. Termination</h3>
        <p>We reserve the right to terminate accounts that violate these terms.</p>
      `
    },
    'privacy': {
      title: 'Privacy Policy',
      content: `
        <h2>Privacy Policy</h2>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3>1. Information We Collect</h3>
        <ul>
          <li><strong>Account Information:</strong> Email, nickname, campus affiliation</li>
          <li><strong>Content:</strong> Videos, descriptions, comments you submit</li>
          <li><strong>Usage Data:</strong> How you interact with our platform</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
        </ul>
        
        <h3>2. How We Use Your Information</h3>
        <ul>
          <li>To provide and improve our services</li>
          <li>To display your content on the platform</li>
          <li>To communicate with you about challenges and updates</li>
          <li>To ensure platform security and prevent abuse</li>
        </ul>
        
        <h3>3. Data Sharing</h3>
        <p>We do not sell your personal data. We may share data with:</p>
        <ul>
          <li>Service providers (hosting, analytics)</li>
          <li>Campus administrators for participation tracking</li>
          <li>Legal authorities when required by law</li>
        </ul>
        
        <h3>4. Your Rights</h3>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Delete your account and data</li>
          <li>Opt-out of marketing communications</li>
        </ul>
      `
    }
  };

  const currentContent = content[page] || {
    title: 'Page Not Found',
    content: '<p>The requested legal document could not be found.</p>'
  };

return (
  <div className="legal-container">
    <div className="legal-content">
      <h1>{currentContent.title}</h1>
      <div 
        className="legal-text"
        dangerouslySetInnerHTML={{ __html: currentContent.content }}
      />
      <div className="print-button-container">
        <button 
          className="back-button"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
        <button 
          className="print-button"
          onClick={() => window.print()}
        >
          🖨️ Print
        </button>
      </div>
    </div>
  </div>
);
}