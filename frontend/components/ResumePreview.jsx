import { useState } from 'react';

export default function ResumePreview({ resume }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(resume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="resume-preview">
      <div className="preview-header">
        <div className="header-content">
          <div className="header-icon">✨</div>
          <h2>Generated Resume</h2>
        </div>
        <div className="actions">
          <button onClick={handleCopy} className={`action-button copy-btn ${copied ? 'copied' : ''}`}>
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button onClick={handleDownload} className="action-button download-btn">
            💾 Download
          </button>
        </div>
      </div>
      <div className="preview-content">
        <pre>{resume}</pre>
      </div>

      <style jsx>{`
        .resume-preview {
          margin-top: 3rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          font-size: 2rem;
        }

        .preview-header h2 {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .actions {
          display: flex;
          gap: 1rem;
        }

        .action-button {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .action-button:hover {
          background: white;
          color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .copy-btn.copied {
          background: #43e97b;
          border-color: #43e97b;
          color: white;
        }

        .preview-content {
          padding: 2.5rem;
          max-height: 700px;
          overflow-y: auto;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .preview-content pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: 'Courier New', 'Monaco', monospace;
          font-size: 0.95rem;
          line-height: 1.8;
          color: #333;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .preview-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .actions {
            width: 100%;
            flex-direction: column;
          }

          .action-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
