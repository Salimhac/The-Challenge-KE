import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Upload.module.css';
import { supabase } from '../../../services/supabase';
import { extractVideoId } from '../../../utils/videoUtils';
import { useAuth } from '../../../hooks/useAuth';

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campuses, setCampuses] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoError, setVideoError] = useState('');
  
  const [formData, setFormData] = useState({
    nickname: '',
    campusId: '',
    videoUrl: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campusesRes, challengeRes] = await Promise.all([
        supabase.from('campuses').select('*').order('name'),
        supabase
          .from('challenges')
          .select('*')
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      if (campusesRes.error) throw campusesRes.error;
      if (challengeRes.error && challengeRes.error.code !== 'PGRST116') throw challengeRes.error;

      setCampuses(campusesRes.data || []);
      setCurrentChallenge(challengeRes.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUrlChange = async (e) => {
    const url = e.target.value;
    setFormData({ ...formData, videoUrl: url });
    
    if (!url) {
      setVideoPreview(null);
      setVideoError('');
      return;
    }

    const videoInfo = extractVideoId(url);
    if (!videoInfo) {
      setVideoError('Please enter a valid TikTok or Instagram URL');
      setVideoPreview(null);
      return;
    }

    setVideoError('');
    
    if (videoInfo.platform === 'tiktok') {
      setVideoPreview({
        platform: 'tiktok',
        id: videoInfo.id,
        embedUrl: `https://www.tiktok.com/embed/v2/${videoInfo.id}`
      });
    } else if (videoInfo.platform === 'instagram') {
      setVideoPreview({
        platform: 'instagram',
        id: videoInfo.id,
        embedUrl: `https://www.instagram.com/p/${videoInfo.id}/embed`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to upload a video');
      navigate('/auth');
      return;
    }

    if (!currentChallenge) {
      alert('No active challenge found');
      return;
    }

    const videoInfo = extractVideoId(formData.videoUrl);
    if (!videoInfo) {
      setVideoError('Please enter a valid TikTok or Instagram URL');
      return;
    }

    setSubmitting(true);

    try {
      // First, create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname: formData.nickname,
          campus_id: formData.campusId || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      // Check if user already submitted for this challenge
      const { data: existingEntry } = await supabase
        .from('entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('challenge_id', currentChallenge.id)
        .maybeSingle();

      if (existingEntry) {
        alert('You have already submitted an entry for this challenge');
        return;
      }

      // Create entry
      const { error: entryError } = await supabase
        .from('entries')
        .insert({
          user_id: user.id,
          challenge_id: currentChallenge.id,
          video_url: formData.videoUrl,
          platform: videoInfo.platform,
          video_id: videoInfo.id,
          title: formData.title,
          description: formData.description,
          is_approved: true
        });

      if (entryError) throw entryError;

      alert('Entry submitted successfully!');
      navigate('/entries');
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('Error submitting entry: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!currentChallenge) {
    return (
      <div className={styles.noChallenge}>
        <h2>No Active Challenge</h2>
        <p>There's no active challenge to submit to right now. Check back soon!</p>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          ← Back
        </button>
        <h1 className={styles.title}>Upload Your Entry</h1>
        <div className={styles.currentChallenge}>
          <span className={styles.challengeLabel}>Challenge:</span>
          <span className={styles.challengeTitle}>{currentChallenge.title}</span>
        </div>
      </header>

      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Your Details</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="nickname" className={styles.label}>
                  Nickname *
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Choose a display name"
                  required
                  minLength={2}
                  maxLength={50}
                />
                <p className={styles.helpText}>
                  This is how you'll appear on the leaderboard
                </p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="campusId" className={styles.label}>
                  Campus or Estate
                </label>
                <select
                  id="campusId"
                  name="campusId"
                  value={formData.campusId}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Select your campus/estate</option>
                  {campuses.map(campus => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name} ({campus.type})
                    </option>
                  ))}
                </select>
                <p className={styles.helpText}>
                  Optional: Represent your campus or estate
                </p>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Video Submission</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="videoUrl" className={styles.label}>
                  TikTok or Instagram URL *
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleVideoUrlChange}
                  className={`${styles.input} ${videoError ? styles.inputError : ''}`}
                  placeholder="https://www.tiktok.com/@user/video/123456..."
                  required
                />
                {videoError && (
                  <p className={styles.errorText}>{videoError}</p>
                )}
                <p className={styles.helpText}>
                  Paste the full URL of your TikTok or Instagram video
                </p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  Video Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Give your video a catchy title"
                  required
                  maxLength={200}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.label}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Tell us about your video..."
                  rows={4}
                  maxLength={500}
                />
                <p className={styles.charCount}>
                  {formData.description.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {videoPreview && (
            <div className={styles.previewSection}>
              <h3 className={styles.previewTitle}>Preview</h3>
              <div className={styles.videoPreview}>
                <iframe
                  src={videoPreview.embedUrl}
                  title="Video preview"
                  className={styles.embedIframe}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className={styles.submitSection}>
            <p className={styles.terms}>
              By submitting, you agree to our Terms of Service and confirm that
              you own the rights to this video.
            </p>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting || !formData.videoUrl || !formData.nickname || !formData.title}
            >
              {submitting ? 'Submitting...' : 'Submit Entry'}
            </button>
          </div>
        </form>

        <div className={styles.guidelines}>
          <h3 className={styles.guidelinesTitle}>Submission Guidelines</h3>
          <ul className={styles.guidelinesList}>
            <li>✅ Videos must be your original content</li>
            <li>✅ Must be appropriate for all audiences</li>
            <li>✅ Must relate to the current challenge theme</li>
            <li>❌ No hate speech, bullying, or harassment</li>
            <li>❌ No copyrighted music without permission</li>
            <li>❌ No spam or low-effort content</li>
          </ul>
          <p className={styles.note}>
            Videos violating guidelines will be removed without notice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upload;