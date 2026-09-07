import React, { useState, useEffect, useRef } from 'react';

const CustomDropdown = ({ options = [], value, onChange, placeholder, name, required, theme, allowCustom = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(opt => {
    const label = typeof opt === 'string' ? opt : opt.label;
    return String(label).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const exactMatchExists = options.some(opt => {
    const label = typeof opt === 'string' ? opt : opt.label;
    return String(label).toLowerCase() === searchQuery.trim().toLowerCase();
  });

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length === 1) {
        const opt = filteredOptions[0];
        const optVal = typeof opt === 'string' ? opt : opt.value;
        handleSelect(optVal);
      } else if (allowCustom && searchQuery.trim()) {
        handleSelect(searchQuery.trim());
      }
    }
  };

  const getSelectedLabel = () => {
    if (value === undefined || value === null || value === '') return '';
    const found = options.find(opt => {
      const optVal = typeof opt === 'string' ? opt : opt.value;
      return String(optVal) === String(value);
    });
    if (found) {
      return typeof found === 'string' ? found : found.label;
    }
    return allowCustom ? String(value) : '';
  };

  const isDisabled = !allowCustom && (!options || options.length === 0);
  const themeClass = theme === 'dark' ? 'c-dropdown-dark' : theme === 'light' ? 'c-dropdown-light' : '';

  return (
    <div className={`c-dropdown-container ${themeClass} ${isOpen ? 'is-open' : ''}`} ref={dropdownRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 1000 : 1 }}>
      {/* Hidden input for HTML form submissions */}
      <input type="hidden" name={name} value={value || ''} required={required} />

      {isOpen ? (
        <div className="c-dropdown-trigger is-searching">
          <input
            type="text"
            className="c-dropdown-search-input"
            placeholder={placeholder ? `Search or type custom...` : "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <span className="c-dropdown-arrow" onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }}>▲</span>
        </div>
      ) : (
        <div 
          className={`c-dropdown-trigger ${value ? 'has-value' : 'is-placeholder'} ${isDisabled ? 'is-disabled' : ''}`}
          onClick={() => !isDisabled && setIsOpen(true)}
        >
          <span className="c-dropdown-text">{getSelectedLabel() || placeholder || 'Select option'}</span>
          <span className="c-dropdown-arrow">▼</span>
        </div>
      )}

      {isOpen && (
        <div className="c-dropdown-menu" style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 10000,
          maxHeight: '220px',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          border: '1px solid #cbd5e1'
        }}>
          {/* Custom Typed Value Option */}
          {allowCustom && searchQuery.trim() && !exactMatchExists && (
            <div 
              className="c-dropdown-item c-dropdown-custom-item"
              onClick={() => handleSelect(searchQuery.trim())}
              style={{
                background: '#fff0eb',
                fontWeight: 700,
                color: '#ff5c1a',
                borderBottom: '1px solid #fed7aa',
                padding: '10px 14px',
                cursor: 'pointer'
              }}
            >
              <span className="c-dropdown-item-label">Use "{searchQuery.trim()}"</span>
            </div>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const optVal = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const isSelected = String(optVal) === String(value);

              return (
                <div 
                  key={idx}
                  className={`c-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(optVal)}
                >
                  <span className="c-dropdown-item-label">{optLabel}</span>
                  {isSelected && <span className="c-dropdown-checkmark">✓</span>}
                </div>
              );
            })
          ) : (
            !allowCustom && <div className="c-dropdown-no-results">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
