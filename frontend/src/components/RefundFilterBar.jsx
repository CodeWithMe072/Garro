import React, { useState, useEffect } from 'react';
import { LuSearch, LuX, LuSlidersHorizontal, LuRotateCcw } from 'react-icons/lu';
import CustomDropdown from './CustomDropdown';

const RefundFilterBar = ({ filters, onFilterChange, onResetFilters }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Debounced search input handler (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFilterChange('search', searchTerm);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, onFilterChange]);

  const hasActiveFilters = filters.status !== 'all' || filters.dateFrom || filters.dateTo || filters.service !== 'all' || filters.search || filters.sort !== 'newest';

  const statusOptions = [
    { value: 'all', label: 'Status: All' },
    { value: 'pending', label: '⏳ Pending Review' },
    { value: 'approved', label: '✓ Approved & Refunded' },
    { value: 'rejected', label: '✕ Rejected' }
  ];

  const serviceOptions = [
    { value: 'all', label: 'Service: All Services' },
    { value: 'battery', label: 'Battery Replacement' },
    { value: 'emergency_pickup', label: 'Emergency Pickup' },
    { value: 'minor_service', label: 'Minor Service' },
    { value: 'major_service', label: 'Major Service' },
    { value: 'ac_repair', label: 'AC Repair' },
    { value: 'brake_repair', label: 'Brake Repair' },
    { value: 'roadside_assistance', label: 'Roadside Assistance' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Sort: Newest First' },
    { value: 'oldest', label: 'Sort: Oldest First' },
    { value: 'highest_refund', label: 'Sort: Highest Refund' },
    { value: 'lowest_refund', label: 'Sort: Lowest Refund' }
  ];

  return (
    <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0', width: '100%', maxWidth: '100%' }}>
      {/* Mobile Toggle Button */}
      <div className="d-md-none d-flex justify-content-between align-items-center mb-2">
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 fw-semibold"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          style={{ borderRadius: '8px' }}
        >
          <LuSlidersHorizontal size={15} /> Filters &amp; Search {hasActiveFilters && <span className="badge bg-primary rounded-circle p-1"></span>}
        </button>
        {hasActiveFilters && (
          <button onClick={onResetFilters} className="btn btn-link text-danger btn-sm p-0 fw-semibold" style={{ textDecoration: 'none', fontSize: '12px' }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Row Controls (Structured 2-Row Layout) */}
      <div className={`d-flex flex-column gap-3 ${isMobileFiltersOpen ? 'd-flex' : 'd-none d-md-flex'}`}>
        
        {/* ROW 1: Search + Status + Service */}
        <div className="row g-2 align-items-center">
          {/* 1. Search Input */}
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <LuSearch size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control form-control-sm ps-5"
                placeholder="Search Booking ID, Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: '10px', fontSize: '13px', height: '38px', borderColor: '#cbd5e1' }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn p-0 position-absolute text-muted"
                  style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none' }}
                  onClick={() => { setSearchTerm(''); onFilterChange('search', ''); }}
                >
                  <LuX size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 2. Status Custom Dropdown */}
          <div className="col-6 col-md-3">
            <CustomDropdown
              options={statusOptions}
              value={filters.status || 'all'}
              onChange={(val) => onFilterChange('status', val)}
              placeholder="Status: All"
            />
          </div>

          {/* 3. Service Type Custom Dropdown */}
          <div className="col-6 col-md-4">
            <CustomDropdown
              options={serviceOptions}
              value={filters.service || 'all'}
              onChange={(val) => onFilterChange('service', val)}
              placeholder="Service: All Services"
            />
          </div>
        </div>

        {/* ROW 2: Date From + Date To + Sort + Clear Button */}
        <div className="row g-2 align-items-center">
          {/* Date From */}
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-semibold" style={{ fontSize: '12px', minWidth: '40px' }}>From:</span>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.dateFrom || ''}
                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                style={{ borderRadius: '8px', fontSize: '12px', height: '38px', borderColor: '#cbd5e1', minWidth: '135px' }}
              />
            </div>
          </div>

          {/* Date To */}
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-semibold" style={{ fontSize: '12px', minWidth: '25px' }}>To:</span>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.dateTo || ''}
                onChange={(e) => onFilterChange('dateTo', e.target.value)}
                style={{ borderRadius: '8px', fontSize: '12px', height: '38px', borderColor: '#cbd5e1', minWidth: '135px' }}
              />
            </div>
          </div>

          {/* Sort Custom Dropdown */}
          <div className="col-6 col-md-4">
            <CustomDropdown
              options={sortOptions}
              value={filters.sort || 'newest'}
              onChange={(val) => onFilterChange('sort', val)}
              placeholder="Sort: Newest First"
            />
          </div>

          {/* Reset Filters Button */}
          <div className="col-6 col-md-2 text-end">
            {hasActiveFilters ? (
              <button
                onClick={onResetFilters}
                className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-1 fw-bold"
                style={{ borderRadius: '10px', height: '38px', fontSize: '12px' }}
              >
                <LuRotateCcw size={13} /> Clear
              </button>
            ) : (
              <div style={{ height: '38px' }}></div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RefundFilterBar;
