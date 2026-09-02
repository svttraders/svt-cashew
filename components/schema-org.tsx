import React from 'react';

export default function SchemaOrg() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Sidhi Vinayaka Traders",
    "alternateName": "SVT Supreme Cashews",
    "image": "https://svtcashews.com/logo.png",
    "telephone": "+919515273464",
    "email": "sahuravindra897@gmail.com",
    "url": "https://svtcashews.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1-53/6, Surya Nagar Colony",
      "addressLocality": "Uppal, Hyderabad",
      "addressRegion": "Telangana",
      "postalCode": "500039",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "17.4018",
      "longitude": "78.5602"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "21:00"
    },
    "priceRange": "₹750 - ₹950",
    "description": "Premium flavoured and raw cashews wholesale and retail supplier in Uppal, Hyderabad. Specialties: W180 Jumbo Cashews, Peri Peri, Tandoori Masala, Pudina Cashews."
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
