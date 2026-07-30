import React from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const Pagination = ({ page, totalPages, totalResults, limit, onPageChange, onLimitChange }) => {
  if (totalPages <= 1 && totalResults <= 10) return null;

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, totalResults);

  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-2">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted small">
          Showing <strong>{totalResults > 0 ? `${startIdx}-${endIdx}` : '0'}</strong> of <strong>{totalResults}</strong> refund requests
        </span>
        {onLimitChange && (
          <select
            className="form-select form-select-sm ms-2"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{ width: '80px', borderRadius: '8px', fontSize: '12px' }}
          >
            <option value={10}>10 / pg</option>
            <option value={20}>20 / pg</option>
            <option value={50}>50 / pg</option>
          </select>
        )}
      </div>

      <div className="d-flex align-items-center gap-1">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ borderRadius: '8px', padding: '5px 10px' }}
        >
          <LuChevronLeft size={14} /> Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
            return (
              <button
                key={p}
                className={`btn btn-sm ${p === page ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => onPageChange(p)}
                style={{ borderRadius: '8px', minWidth: '32px' }}
              >
                {p}
              </button>
            );
          } else if (p === page - 2 || p === page + 2) {
            return <span key={p} className="text-muted small px-1">...</span>;
          }
          return null;
        })}

        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{ borderRadius: '8px', padding: '5px 10px' }}
        >
          Next <LuChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
