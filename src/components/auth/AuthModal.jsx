import React, { useState, useEffect } from 'react';
import styles from './AuthModal.module.css';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

const AuthModal = ({ onClose, mode = 'signin' }) => {
  const { signUp, signIn } = useAuth();
  const [activeMode, setActiveMode] = useState(mode);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    campusId: ''
  });

  useEffect(() => {
    fetchCampuses();
  }, []);

  const fetchCampuses = async () => {
    try {
      const { data, error } = await supabase
        .from('campuses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCampuses(data || []);
    } catch (error) {
      console.error('Error fetching campuses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeMode === 'signup') {
        const result = await signUp(
          formData.email,
          formData.password,
          formData.nickname,
          formData.campusId
        );

        if (result.success) {
          onClose();
        } else {
          setError(result.error);
        }
      } else {
        const result = await signIn(formData.email, formData.password);
        
        if (result.success) {
          onClose();
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeMode === 'signin' ? styles.active : ''}`}
            onClick={() => setActiveMode('signin')}
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${activeMode === 'signup' ? styles.active : ''}`}
            onClick={() => setActiveMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {activeMode === 'signup' && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="nickname" className={styles.label}>
                  Nickname
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Choose a display name"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="campusId" className={styles.label}>
                  Campus/Estate (Optional)
                </label>
                <select
                  id="campusId"
                  name="campusId"
                  value={formData.campusId}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="">Select campus or estate</option>
                  {campuses.map(campus => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name} ({campus.type})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Processing...' : activeMode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>

          <p className={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;