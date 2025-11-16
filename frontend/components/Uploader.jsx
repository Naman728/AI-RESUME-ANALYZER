import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function Uploader({ onSuccess, onError, loading, setLoading }) {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      onError('Invalid file type. Please upload a PDF or image (PNG/JPEG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('File size exceeds 10MB limit');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary for FormData
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onSuccess(data);
    } catch (err) {
      // Handle different types of errors
      let errorMessage = 'Failed to upload file';
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = `Cannot connect to backend server. Please ensure the backend is running at ${API_BASE}. Error: ${err.message}`;
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = `Upload failed: ${err.toString()}`;
      }
      
      console.error('Upload error:', err);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="uploader">
      <div
        className={`dropzone ${dragActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
          disabled={loading}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" className="upload-label">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <span className="upload-text">Drag & drop your resume here</span>
              <span className="upload-subtext">or click to browse</span>
              <span className="upload-hint">PDF, PNG, or JPEG (max 10MB)</span>
            </>
          )}
        </label>
      </div>

      <style jsx>{`
        .uploader {
          margin: 2rem 0;
        }

        .dropzone {
          border: 3px dashed #ddd;
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          position: relative;
          overflow: hidden;
        }

        .dropzone::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .dropzone.active::before {
          opacity: 1;
        }

        .dropzone.active {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
          transform: scale(1.02);
        }

        .dropzone.loading {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }

        .upload-icon {
          font-size: 4rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .upload-text {
          font-size: 1.3rem;
          font-weight: 600;
          color: #333;
        }

        .upload-subtext {
          font-size: 1rem;
          color: #667eea;
          font-weight: 500;
        }

        .upload-hint {
          font-size: 0.9rem;
          color: #666;
          margin-top: 0.5rem;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(102, 126, 234, 0.2);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
