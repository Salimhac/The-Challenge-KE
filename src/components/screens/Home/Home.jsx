import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import { supabase } from '../../../services/supabase';
import { format } from 'date-fns';

const Home = () => {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const timerRef = useRef(null);

  const fetchCurrentChallenge = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setCurrentChallenge(data);
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCountdown = useCallback(() => {
    if (!currentChallenge) return;
    
    const endDate = new Date(currentChallenge.end_date);
    const now = new Date();
    const diff = endDate - now;
    
    if (diff <= 0) {
      setTimeLeft('Challenge ended');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
  }, [currentChallenge]);

  useEffect(() => {
    fetchCurrentChallenge();
  }, [fetchCurrentChallenge]);

  useEffect(() => {
    // Start the countdown timer
    updateCountdown(); // Initial call
    timerRef.current = setInterval(updateCountdown, 1000);
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [updateCountdown]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Kenya Campus Challenge</h1>
        <p className={styles.tagline}>Showcase Your Talent. Vote for the Best!</p>
      </header>

      {currentChallenge ? (
        <main className={styles.main}>
          <section className={styles.challengeSection}>
            <div className={styles.challengeCard}>
              <div className={styles.challengeHeader}>
                <span className={styles.badge}>This Week's Challenge</span>
                <div className={styles.timer}>
                  <span className={styles.timerIcon}>⏰</span>
                  <span className={styles.timerText}>Ends in: {timeLeft}</span>
                </div>
              </div>
              
              <h2 className={styles.challengeTitle}>{currentChallenge.title}</h2>
              <p className={styles.challengeDescription}>{currentChallenge.description}</p>
              
              <div className={styles.challengeMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Theme:</span>
                  <span className={styles.metaValue}>{currentChallenge.theme}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Duration:</span>
                  <span className={styles.metaValue}>
                    {format(new Date(currentChallenge.start_date), 'MMM d')} - 
                    {format(new Date(currentChallenge.end_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.ctaSection}>
            <div className={styles.ctaGrid}>
              <Link to="/upload" className={styles.ctaCard}>
                <div className={styles.ctaIcon}>🎬</div>
                <h3 className={styles.ctaTitle}>Upload Video</h3>
                <p className={styles.ctaDescription}>
                  Share your TikTok or Instagram video for this week's challenge
                </p>
                <button className={styles.ctaButton}>Get Started</button>
              </Link>

              <Link to="/entries" className={styles.ctaCard}>
                <div className={styles.ctaIcon}>👀</div>
                <h3 className={styles.ctaTitle}>View Entries</h3>
                <p className={styles.ctaDescription}>
                  Watch all submissions and vote for your favorites
                </p>
                <button className={styles.ctaButton}>Browse Entries</button>
              </Link>

              <Link to="/leaderboard" className={styles.ctaCard}>
                <div className={styles.ctaIcon}>🏆</div>
                <h3 className={styles.ctaTitle}>Leaderboard</h3>
                <p className={styles.ctaDescription}>
                  See who's leading and track the competition
                </p>
                <button className={styles.ctaButton}>View Rankings</button>
              </Link>
            </div>
          </section>

          <section className={styles.howItWorks}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <h3>Join Challenge</h3>
                <p>Sign up and pick your campus or estate</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <h3>Upload Video</h3>
                <p>Share your TikTok/Instagram link</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <h3>Get Votes</h3>
                <p>Share with friends to get votes</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <h3>Win Prizes</h3>
                <p>Top entries win recognition & prizes</p>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <div className={styles.noChallenge}>
          <h2>No Active Challenge</h2>
          <p>Check back soon for the next challenge!</p>
        </div>
      )}

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Kenya Campus Challenge</p>
        <p>For Kenyan youth by Kenyan youth 🇰🇪</p>
      </footer>
    </div>
  );
};

export default Home;