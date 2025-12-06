export const validateVideoUrl = (url) => {
  const patterns = {
    tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+(\?.*)?$/,
    instagram: /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+(\/.*)?$/
  };

  for (const [platform, pattern] of Object.entries(patterns)) {
    if (pattern.test(url)) {
      return { isValid: true, platform };
    }
  }

  return { isValid: false, platform: null };
};

export const rateLimiter = () => {
  const limits = new Map(); // In production, use Redis or database

  return {
    checkLimit: (userId, action, limit = 50, windowMs = 24 * 60 * 60 * 1000) => {
      const key = `${userId}:${action}`;
      const now = Date.now();
      const userLimits = limits.get(key) || [];

      // Clean old entries
      const validEntries = userLimits.filter(time => now - time < windowMs);
      
      if (validEntries.length >= limit) {
        return false;
      }

      validEntries.push(now);
      limits.set(key, validEntries);
      return true;
    },

    getRemaining: (userId, action, limit = 50) => {
      const key = `${userId}:${action}`;
      const userLimits = limits.get(key) || [];
      const now = Date.now();
      const windowMs = 24 * 60 * 60 * 1000;
      
      const validEntries = userLimits.filter(time => now - time < windowMs);
      return Math.max(0, limit - validEntries.length);
    }
  };
};

export const contentModeration = {
  checkForProfanity: (text) => {
    const profanityList = [
      // Add profanity words to filter (Kenyan context)
    ];
    
    const words = text.toLowerCase().split(/\W+/);
    return words.some(word => profanityList.includes(word));
  },

  validateContent: (content) => {
    const issues = [];
    
    if (content.length < 5) {
      issues.push('Content too short');
    }
    
    if (content.length > 1000) {
      issues.push('Content too long');
    }
    
    if (this.checkForProfanity(content)) {
      issues.push('Inappropriate language detected');
    }
    
    return issues;
  }
};