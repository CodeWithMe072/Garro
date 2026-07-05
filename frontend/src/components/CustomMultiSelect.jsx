import React, { useState, useEffect, useRef } from 'react';

const CustomMultiSelect = ({ options, value = [], onChange, placeholder, theme = 'light', loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggleOption = (optVal) => {
    let newValue;
    if (value.includes(optVal)) {
      newValue = value.filter(val => val !== optVal);
    } else {
      newValue = [...value, optVal];
    }
    onChange(newValue);
  };

  const handleRemoveValue = (e, optVal) => {
    e.stopPropagation();
    onChange(value.filter(val => val !== optVal));
  };

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDark = theme === 'dark';

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: 'inherit'
      }}
    >
      {/* Trigger Area */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minHeight: '44px',
          padding: '6px 12px',
          background: isDark ? '#1e293b' : '#ffffff',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
          borderRadius: '8px',
          color: isDark ? '#ffffff' : '#0f172a',
          cursor: 'pointer',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
          position: 'relative',
          paddingRight: '30px',
          userSelect: 'none',
          boxSizing: 'border-box'
        }}
      >
        {value.length === 0 ? (
          <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b', fontSize: '14.5px' }}>
            {placeholder || 'Select options...'}
          </span>
        ) : (
          value.map(val => {
            const opt = options.find(o => o.value === val) || { label: val, value: val };
            return (
              <span 
                key={val}
                style={{
                  background: isDark ? '#334155' : '#e2e8f0',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {opt.label}
                <span 
                  onClick={(e) => handleRemoveValue(e, val)}
                  style={{
                    cursor: 'pointer',
                    fontSize: '11px',
                    lineHeight: 1,
                    padding: '2px',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseOut={(e) => e.target.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}
                >
                  ✕
                </span>
              </span>
            );
          })
        )}
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b',
          fontSize: '12px'
        }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: isDark ? '#1e293b' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            zIndex: 99999,
            maxHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Search Input */}
          <div style={{ padding: '8px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f1f5f9' }}>
            <input 
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                background: isDark ? '#0f172a' : '#f8fafc',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                borderRadius: '6px',
                color: isDark ? '#ffffff' : '#0f172a',
                outline: 'none',
                fontSize: '13.5px',
                boxSizing: 'border-box'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
            {loading ? (
              <div style={{ padding: '12px', textAlign: 'center', color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b', fontSize: '13px' }}>
                ⏳ Loading options...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map(opt => {
                const isSelected = value.includes(opt.value);
                return (
                  <div 
                    key={opt.value}
                    onClick={() => handleToggleOption(opt.value)}
                    style={{
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      background: isSelected ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff') : 'transparent',
                      color: isDark ? '#f1f5f9' : '#334155',
                      fontSize: '14px',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = isSelected ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe') : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9')}
                    onMouseLeave={(e) => e.target.style.background = isSelected ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff') : 'transparent'}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: isSelected ? '600' : '400' }}>{opt.label}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b', fontSize: '13px' }}>
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMultiSelect;
