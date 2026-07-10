import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Calendar, Clock, ArrowRight, Tag,
  Search, Mail, Bell, ChevronRight
} from 'lucide-react';

const blogPosts = [
  {
    id: 1, category: 'Maintenance', categoryColor: '#ff5c1a',
    title: 'Top 5 Car Maintenance Tips for Summer in Dubai',
    excerpt: 'Keep your car running smoothly during the hot summer months with these essential UAE-specific maintenance tips for your vehicle.',
    date: 'Jun 20, 2026', readTime: '5 min',
    bg: 'linear-gradient(135deg, #ff5c1a22, #ff8c4222)'
  },
  {
    id: 2, category: 'Tips', categoryColor: '#3b82f6',
    title: 'Understanding Your Dashboard Warning Lights',
    excerpt: 'Don\'t ignore those lights! Learn what the most common dashboard warning lights mean and what to do when they appear.',
    date: 'May 15, 2026', readTime: '4 min',
    bg: 'linear-gradient(135deg, #3b82f622, #60a5fa22)'
  },
  {
    id: 3, category: 'Safety', categoryColor: '#10b981',
    title: 'When to Replace Your Brake Pads',
    excerpt: 'Squeaking brakes? It might be time for a replacement. Here is how to tell when you need new brake pads on your car.',
    date: 'Apr 02, 2026', readTime: '3 min',
    bg: 'linear-gradient(135deg, #10b98122, #34d39922)'
  },
  {
    id: 4, category: 'Guide', categoryColor: '#8b5cf6',
    title: 'How to Choose the Right Garage in UAE',
    excerpt: 'Finding a trustworthy garage can be challenging. This guide covers what to look for and how Garro helps you make the right choice.',
    date: 'Mar 18, 2026', readTime: '6 min',
    bg: 'linear-gradient(135deg, #8b5cf622, #a78bfa22)'
  },
  {
    id: 5, category: 'EV', categoryColor: '#06b6d4',
    title: 'Electric Vehicles in Dubai: What You Need to Know',
    excerpt: 'EV adoption is growing rapidly in the UAE. Here is everything you need to know about owning, charging, and maintaining an EV in Dubai.',
    date: 'Feb 28, 2026', readTime: '7 min',
    bg: 'linear-gradient(135deg, #06b6d422, #22d3ee22)'
  },
  {
    id: 6, category: 'Maintenance', categoryColor: '#ff5c1a',
    title: 'The Importance of Regular Oil Changes',
    excerpt: 'Regular oil changes are the single most important thing you can do for your car engine. Learn the best intervals for UAE climate.',
    date: 'Jan 15, 2026', readTime: '4 min',
    bg: 'linear-gradient(135deg, #f59e0b22, #fbbf2422)'
  },
];

const Blog = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = blogPosts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: '#ffffff', minHeight: 'calc(100vh - var(--nav-h))' }}>

      {/* ── HERO ── */}
      <section style={{
        padding: '72px 0 52px', borderBottom: '1px solid #e2e8f0',
        background: 'radial-gradient(circle at 60% 40%, rgba(255,92,26,0.04) 0%, transparent 65%)'
      }}>
        <div className="container text-center">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,92,26,0.08)', border: '1px solid rgba(255,92,26,0.18)',
            color: '#ff5c1a', padding: '5px 14px', borderRadius: '50px',
            fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '.08em', marginBottom: '20px'
          }}>
            <BookOpen size={13} /> Garro Blog
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 900, color: '#0f172a',
            letterSpacing: '-.03em', marginBottom: '14px', fontFamily: "'Poppins', sans-serif"
          }}>
            Automotive <span style={{ color: '#ff5c1a' }}>Insights & Tips</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.7, fontFamily: "'Poppins', sans-serif" }}>
            Expert automotive advice, maintenance guides, and the latest news from the Garro team.
          </p>

          {/* Search */}
          <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px 13px 44px',
                border: '1.5px solid #e2e8f0', borderRadius: '14px',
                fontSize: '14px', fontFamily: "'Poppins', sans-serif",
                color: '#0f172a', outline: 'none', background: '#fff',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
              }}
            />
          </div>
        </div>
      </section>

      {/* ── BLOG CARDS ── */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>
              <BookOpen size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontSize: '15px' }}>No articles found for "<strong>{searchQuery}</strong>"</p>
              <button onClick={() => setSearchQuery('')} style={{
                marginTop: '12px', background: '#ff5c1a', color: '#fff',
                border: 'none', borderRadius: '10px', padding: '10px 20px',
                fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif"
              }}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map(post => (
                <div key={post.id} className="col-md-6 col-lg-4">
                  <div style={{
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    borderRadius: '20px', overflow: 'hidden', height: '100%',
                    display: 'flex', flexDirection: 'column', transition: 'all 0.25s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#ff5c1a'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    {/* Card image area */}
                    <div style={{
                      height: '180px', background: post.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <BookOpen size={48} color={post.categoryColor} style={{ opacity: 0.5 }} />
                      {/* Category badge */}
                      <div style={{
                        position: 'absolute', top: '14px', left: '14px',
                        background: post.categoryColor, color: '#fff',
                        borderRadius: '50px', padding: '3px 12px',
                        fontSize: '11px', fontWeight: 700, fontFamily: "'Poppins', sans-serif"
                      }}>
                        {post.category}
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Meta */}
                      <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#94a3b8', fontFamily: "'Poppins', sans-serif" }}>
                          <Calendar size={12} /> {post.date}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#94a3b8', fontFamily: "'Poppins', sans-serif" }}>
                          <Clock size={12} /> {post.readTime} read
                        </span>
                      </div>

                      <h5 style={{
                        fontWeight: 800, fontSize: '15.5px', color: '#0f172a',
                        fontFamily: "'Poppins', sans-serif", marginBottom: '10px',
                        lineHeight: 1.4
                      }}>
                        {post.title}
                      </h5>
                      <p style={{
                        fontSize: '13px', color: '#64748b', lineHeight: 1.65,
                        fontFamily: "'Poppins', sans-serif", flex: 1, marginBottom: '18px'
                      }}>
                        {post.excerpt}
                      </p>

                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        color: post.categoryColor, fontWeight: 700, fontSize: '13.5px',
                        fontFamily: "'Poppins', sans-serif", cursor: 'pointer'
                      }}>
                        Read More <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER SUBSCRIBE ── */}
      <section style={{ padding: '0 0 72px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderRadius: '24px', padding: '52px 40px', textAlign: 'center',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Decorative glow */}
            <div style={{
              position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px',
              borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,92,26,0.15), transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'rgba(255,92,26,0.15)', border: '1px solid rgba(255,92,26,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: '#ff5c1a'
            }}>
              <Bell size={24} />
            </div>

            <h3 style={{ fontWeight: 900, fontSize: '24px', color: '#fff', fontFamily: "'Poppins', sans-serif", marginBottom: '10px' }}>
              Stay Updated
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14.5px', fontFamily: "'Poppins', sans-serif", marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
              Get the latest automotive tips, Garro news, and exclusive offers delivered to your inbox.
            </p>

            {subscribed ? (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '12px', padding: '13px 24px',
                color: '#10b981', fontWeight: 700, fontSize: '14px',
                fontFamily: "'Poppins', sans-serif"
              }}>
                ✓ You're subscribed! Thank you.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', maxWidth: '440px', margin: '0 auto', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%', padding: '13px 16px 13px 40px',
                      background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px', fontSize: '13.5px',
                      fontFamily: "'Poppins', sans-serif", color: '#fff',
                      outline: 'none'
                    }}
                  />
                </div>
                <button
                  onClick={() => { if (email) setSubscribed(true); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    padding: '13px 22px', fontWeight: 700, fontSize: '14px',
                    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
                    boxShadow: '0 6px 20px rgba(255,92,26,0.35)', whiteSpace: 'nowrap'
                  }}
                >
                  Subscribe <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
