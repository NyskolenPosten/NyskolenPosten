import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './ArticleDetail.css';

function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${id}`);
        if (!response.ok) {
          throw new Error('Kunne ikke hente artikkel');
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <div className="loading">Laster...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!article) return <div className="error">Artikkel ikke funnet</div>;

  return (
    <div className="article-detail">
      <Helmet>
        <title>{article.title} - Nyskolen Posten</title>
        <meta name="description" content={article.summary} />
        <meta name="keywords" content={`${article.tags.join(', ')}, nyskolen, skoleavis`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary} />
        <meta property="og:type" content="article" />
        {article.image && <meta property="og:image" content={article.image} />}
      </Helmet>

      <h1>{article.title}</h1>
      <div className="article-meta">
        <span className="author">Skrevet av: {article.author}</span>
        <span className="date">{new Date(article.date).toLocaleDateString('nb-NO')}</span>
      </div>
      {article.image && (
        <img src={article.image} alt={article.title} className="article-image" />
      )}
      <div className="article-content">
        {article.content}
      </div>
      {article.tags && article.tags.length > 0 && (
        <div className="article-tags">
          {article.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticleDetail; 