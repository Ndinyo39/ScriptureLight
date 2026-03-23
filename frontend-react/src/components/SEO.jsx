import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, type = 'website', image = '/Logo.png' }) => {
  const fullTitle = title ? `${title} | ScriptureLight` : 'ScriptureLight - Your Spiritual Journey';
  const fullDescription = description || 'ScriptureLight is your digital companion for Bible reading, study plans, and sharing testimonies with a global community of believers.';
  const url = window.location.href;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Facebook / OpenGraph tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:description" content={fullDescription} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content="@ScriptureLight" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
