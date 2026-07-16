import React, { useState } from 'react';
import { LuSearch as SearchIcon, LuArrowRight, LuStar, LuMapPin, LuCircleCheck } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const mockGarages = [
  { id: 1, name: 'SuperTech Auto Garage', area: 'Al Quoz, Dubai', rating: 4.8, reviews: 124, verified: true },
  { id: 2, name: 'Elite Motors Service', area: 'Deira, Dubai', rating: 4.6, reviews: 89, verified: true },
  { id: 3, name: 'QuickFix Auto Care', area: 'Al Qusais, Dubai', rating: 4.5, reviews: 56, verified: false },
];

const Search = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const filtered = mockGarages.filter(g => 
    g.name.toLowerCase().includes(query.toLowerCase()) || 
    g.area.toLowerCase().includes(query.toLowerCase())
  );

  const isAdmin = ['manager', 'superadmin', 'admin'].includes(user?.role);

  const renderContent = () => (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h))', width: '100%' }}>
      {/* Search Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '40px 0 32px' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', fontFamily: "'Poppins', sans-serif", marginBottom: '20px' }}>
            Find the Best Garages in UAE
          </h1>
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <SearchIcon size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by garage name or location..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%', padding: '16px 20px 16px 48px',
                border: '1.5px solid #e2e8f0', borderRadius: '16px',
                fontSize: '15px', fontFamily: "'Poppins', sans-serif",
                outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container" style={{ padding: '40px 0' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <SearchIcon size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h4 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>No results found</h4>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px' }}>Try searching with a different keyword.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map(garage => (
              <div key={garage.id} className="col-md-6 col-lg-4">
                <div style={{
                  background: '#fff', border: '1.5px solid #e2e8f0',
                  borderRadius: '20px', padding: '24px', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', height: '100%'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#ff5c1a'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(255,92,26,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h5 style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', fontFamily: "'Poppins', sans-serif", margin: 0, paddingRight: '12px' }}>
                      {garage.name}
                    </h5>
                    {garage.verified && (
                      <div title="Verified Partner" style={{ color: '#10b981', display: 'flex' }}>
                        <LuCircleCheck size={20} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13.5px', fontFamily: "'Poppins', sans-serif", marginBottom: '12px' }}>
                    <LuMapPin size={16} color="#ff5c1a" /> {garage.area}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#f59e0b', padding: '4px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                      <LuStar size={14} fill="#f59e0b" /> {garage.rating}
                    </div>
                    <span style={{ fontSize: '13px', color: '#94a3b8', fontFamily: "'Poppins', sans-serif" }}>({garage.reviews} reviews)</span>
                  </div>

                  <Link 
                    to={`/garage/${garage.id}`} 
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: 'rgba(255,92,26,0.08)', color: '#ff5c1a', textDecoration: 'none',
                      padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
                      fontFamily: "'Poppins', sans-serif", transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ff5c1a'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,92,26,0.08)'; e.currentTarget.style.color = '#ff5c1a'; }}
                  >
                    View Garage <LuArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );

  if (isAdmin) {
    return (
      <div className="dash-wrapper">
        <AdminSidebar />
        <main className="dash-main w-100" style={{ padding: '0 2rem' }}>
          {renderContent()}
        </main>
      </div>
    );
  }

  return renderContent();
};

export default Search;
