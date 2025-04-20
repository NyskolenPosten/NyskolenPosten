import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = () => {
  return (
    <Helmet>
      <title>Nyskolen Posten – Nyheter fra Nyskolen</title>
      <meta name="description" content="Les de nyeste artiklene og nyhetene fra Nyskolen Posten. Skrevet av elevene på Nyskolen i Oslo." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
    </Helmet>
  );
};

export default SEO; 