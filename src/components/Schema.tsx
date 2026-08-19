export default function Schema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://vattams.net/#organization',
        name: 'VATTAMS Academy',
        url: 'https://vattams.net',
        logo: 'https://vattams.net/vattams-academy-logo.svg',
        description: 'VATTAMS Academy is an online learning platform for academic education, skills, competitive exams, competitions and certificates.',
        areaServed: { '@type': 'Country', name: 'India' },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://vattams.net/#website',
        url: 'https://vattams.net',
        name: 'VATTAMS Academy',
        alternateName: 'VATTAMS Academy',
        publisher: { '@id': 'https://vattams.net/#organization' },
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
