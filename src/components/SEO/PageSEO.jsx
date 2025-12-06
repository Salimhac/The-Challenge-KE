import SEO from './SEO';

export default function PageSEO({ pageTitle, pageDescription, pageImage, pageUrl }) {
  const defaultImage = 'https://yourdomain.com/og-image.jpg';
  const defaultUrl = 'https://yourdomain.com';
  
  return (
    <SEO
      title={pageTitle}
      description={pageDescription}
      image={pageImage || defaultImage}
      url={pageUrl || defaultUrl}
      canonical={pageUrl || defaultUrl}
    />
  );
}