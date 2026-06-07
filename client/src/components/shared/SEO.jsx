import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = "Study Repository | Premium Academic Resources", 
  description = "A premium academic repository for students to share, discover, and download high-quality study materials, notes, and past papers.",
  keywords = "student, study resources, education, college notes, university, academic, PDF, mock tests",
  type = "website",
  url = "https://study-repository-ten.vercel.app",
  image = "/og-image.png",
  noindex = false,
  schema = null
}) {
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Study Repository",
    "url": "https://study-repository-ten.vercel.app",
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://study-repository-ten.vercel.app/browse?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const jsonLd = schema || defaultSchema;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Study Repository" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      <link rel="canonical" href={url} />

      {/* Structured Data / JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}
