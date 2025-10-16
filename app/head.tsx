export default function Head() {
  const siteName = "NEFE Token";
  const siteUrl = "/";

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: "/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: "/logo.png",
  };

  return (
    <>
      {/* Explicit favicon links */}
      <link rel="icon" href="/coin-icon.svg" type="image/svg+xml" />
      <link rel="icon" href="/favicon.png" type="image/png" />
      <link rel="shortcut icon" href="/favicon.png" type="image/png" />

      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
      />
    </>
  );
}