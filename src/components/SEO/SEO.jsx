import { Helmet, HelmetProvider } from 'react-helmet-async';

export default function SEO({
  title = 'Kenya Campus Challenge - Showcase Your Talent',
  description = 'Join Kenya Campus Challenge! Vote for the best TikTok dance videos from campuses across Kenya. Showcase your talent, participate in challenges, and win amazing prizes.',
  keywords = 'Kenya Campus Challenge, TikTok Challenge, Dance Competition, Campus Talent, University Competition, Student Challenge, Vote TikTok',
  image = 'https://yourdomain.com/og-image.jpg',
  url = 'https://yourdomain.com',
  type = 'website',
  author = 'Kenya Campus Challenge',
  robots = 'index, follow',
  canonical = '',
  children
}) {
  const siteTitle = 'Kenya Campus Challenge';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <HelmetProvider>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <meta name="robots" content={robots} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:site_name" content={siteTitle} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@KenyaCampusChallenge" />
        <meta name="twitter:creator" content="@KenyaCampusChallenge" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        
        {/* Canonical URL */}
        {canonical && <link rel="canonical" href={canonical} />}
        
        {/* Additional Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#667eea" />
        
        {/* Structured Data / Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Kenya Campus Challenge",
            "url": url,
            "description": description,
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Any",
            "author": {
              "@type": "Organization",
              "name": "Kenya Campus Challenge",
              "url": url
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
        
        {children}
      </Helmet>
    </HelmetProvider>
  );
}