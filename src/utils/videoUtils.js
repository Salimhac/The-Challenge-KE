export const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    
    // TikTok URLs
    if (url.includes('tiktok.com')) {
      const videoIdMatch = url.match(/\/video\/(\d+)/);
      if (videoIdMatch) return { platform: 'tiktok', id: videoIdMatch[1] };
    }
    
    // Instagram URLs
    if (url.includes('instagram.com')) {
      const instaMatch = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
      if (instaMatch) return { platform: 'instagram', id: instaMatch[2] };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
};

export const getEmbedUrl = (platform, videoId) => {
  if (platform === 'tiktok') {
    return `https://www.tiktok.com/embed/v2/${videoId}`;
  }
  
  if (platform === 'instagram') {
    return `https://www.instagram.com/p/${videoId}/embed`;
  }
  
  return null;
};