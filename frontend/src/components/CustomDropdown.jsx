import React, { useState, useEffect, useRef } from 'react';

const CustomDropdown = ({ options, value, onChange, placeholder, name, required }) => {
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
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getSelectedLabel = () => {
    const found = options.find(opt => {
      const optVal = typeof opt === 'string' ? opt : opt.value;
      return optVal === value;
    });
    if (found) {
      return typeof found === 'string' ? found : found.label;
    }
    return '';
  };

  const isDisabled = !options || options.length === 0;

  return (
    <div className={`c-dropdown-container ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
      {/* Hidden input for HTML form submissions */}
      <input type="hidden" name={name} value={value || ''} required={required} />

      {isOpen ? (
        <div className="c-dropdown-trigger is-searching">
          <input
            type="text"
            className="c-dropdown-search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <span className="c-dropdown-arrow">▲</span>
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
        <div className="c-dropdown-menu">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const optVal = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const isSelected = optVal === value;

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
            <div className="c-dropdown-no-results">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
