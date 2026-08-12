import React, { useState, useRef } from 'react';
import { LuUpload, LuFileText, LuX, LuExternalLink, LuShieldAlert } from 'react-icons/lu';

const DocumentDropzone = ({
  doc,
  onFileUpload,
  onClearFile,
  docType,
  acceptedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx'],
  maxSizeMB = 10
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;

    // Check size (max 10MB)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`File too large (max ${maxSizeMB}MB)`);
      return false;
    }

    // Check extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!acceptedExtensions.includes(ext)) {
      setErrorMsg('Only PDF, JPG, PNG, WEBP, DOC allowed');
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const handleFile = (file) => {
    if (validateFile(file)) {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="w-100">
      <input
        type="file"
        ref={fileInputRef}
        className="d-none"
        accept={acceptedExtensions.map(ext => `.${ext}`).join(',')}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {doc.uploading ? (
        <div
          className="d-flex flex-column align-items-center justify-content-center gap-1.5 px-3 py-2 rounded-3 text-warning"
          style={{
            background: '#18181b',
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '12px',
            fontSize: '12px',
            minHeight: '52px'
          }}
        >
          <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
          <span>Uploading {doc.docType || 'document'}...</span>
        </div>
      ) : doc.fileUrl ? (
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '12px',
            minHeight: '52px'
          }}
        >
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-success fw-bold text-truncate small d-inline-flex align-items-center gap-1.5 me-2"
            style={{ fontSize: '12.5px', textDecoration: 'none', maxWidth: '210px' }}
            title={doc.fileName || 'View Document'}
          >
            <LuFileText size={18} className="flex-shrink-0" />
            <span className="text-truncate">{doc.fileName || 'Uploaded File'}</span>
            <LuExternalLink size={12} className="flex-shrink-0 ms-0.5" />
          </a>

          <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              className="btn btn-sm btn-outline-success py-1 px-2.5"
              style={{ fontSize: '11px', borderRadius: '6px' }}
              onClick={handleClick}
            >
              Change
            </button>
            {onClearFile && (
              <button
                type="button"
                className="btn btn-sm text-danger p-0 ms-1 bg-transparent border-0"
                title="Clear file"
                onClick={onClearFile}
              >
                <LuX size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Upload ${docType || 'compliance document'}`}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="d-flex flex-column align-items-center justify-content-center px-3 py-2 rounded-3 text-center w-100"
          style={{
            background: isDragging 
              ? '#27272a' 
              : errorMsg 
              ? 'rgba(239, 68, 68, 0.1)' 
              : '#18181b',
            border: isDragging
              ? '1.5px solid #ffffff'
              : errorMsg
              ? '1.5px solid #ef4444'
              : '1.5px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '12px',
            cursor: 'pointer',
            minHeight: '52px',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {errorMsg ? (
            <div className="d-flex align-items-center gap-1.5 text-danger small">
              <LuShieldAlert size={16} />
              <span style={{ fontSize: '12px' }}>{errorMsg}</span>
            </div>
          ) : (
            <>
              <LuUpload size={20} className="text-light mb-1" style={{ strokeWidth: 1.75 }} />
              <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: '400' }}>
                choice file or drag & drop
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentDropzone;
