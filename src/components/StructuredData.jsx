export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Kenya Campus Challenge",
        "url": "https://yourdomain.com",
        "logo": "https://yourdomain.com/logo.png",
        "sameAs": [
          "https://facebook.com/KenyaCampusChallenge",
          "https://twitter.com/KenyaCampusChallenge",
          "https://instagram.com/KenyaCampusChallenge"
        ]
      },
      {
        "@type": "WebSite",
        "name": "Kenya Campus Challenge",
        "url": "https://yourdomain.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://yourdomain.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}