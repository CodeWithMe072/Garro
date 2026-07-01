import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
    {
      id: 1,
      title: 'Top 5 Car Maintenance Tips for Summer in Dubai',
      excerpt: 'Keep your car running smoothly during the hot summer months with these essential maintenance tips.',
      date: 'Jun 20, 2026',
      author: 'Garro Team'
    },
    {
      id: 2,
      title: 'Understanding Your Car\'s Dashboard Warning Lights',
      excerpt: 'Don\'t ignore those lights! Learn what the most common dashboard warning lights mean and what to do.',
      date: 'May 15, 2026',
      author: 'Service Expert'
    },
    {
      id: 3,
      title: 'When to Replace Your Brake Pads',
      excerpt: 'Squeaking brakes? It might be time for a replacement. Here\'s how to tell when you need new brake pads.',
      date: 'Apr 02, 2026',
      author: 'Garro Team'
    }
  ];

  return (
    <section className="py-5 bg-light" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="section-tag">Latest News</span>
          <h2 className="fw-bold mt-2">Garro Blog</h2>
          <p className="text-muted">Automotive tips, updates, and news from our experts.</p>
        </div>

        <div className="row g-4">
          {blogPosts.map(post => (
            <div key={post.id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ height: '200px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '4rem', opacity: 0.5 }}>📰</span>
                </div>
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between text-muted small mb-3">
                    <span><i className="bi bi-calendar-event me-1"></i>{post.date}</span>
                    <span><i className="bi bi-person me-1"></i>{post.author}</span>
                  </div>
                  <h5 className="fw-bold mb-3">{post.title}</h5>
                  <p className="text-muted small flex-grow-1">{post.excerpt}</p>
                  <Link to={`/blog/${post.id}`} className="btn btn-outline-primary btn-sm mt-3 align-self-start">Read More</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
