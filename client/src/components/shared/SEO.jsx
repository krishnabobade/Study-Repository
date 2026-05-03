import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = "Study Repository | Premium Academic Resources", 
  description = "A premium academic repository for students to share, discover, and download high-quality study materials, notes, and past papers.",
  keywords = "student, study resources, education, college notes, university, academic, PDF, mock tests",
  type = "website",
  url = "https://studyrepo.com",
  image = "/favicon.svg",
  noindex = false
}) {
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

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
