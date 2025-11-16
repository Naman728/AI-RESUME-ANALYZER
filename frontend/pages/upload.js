import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Uploader from '../components/Uploader';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function UploadPage() {
  const [fileId, setFileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const router = useRouter();

  // Check if backend is running
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('error');
        }
      } catch (err) {
        setBackendStatus('offline');
        console.error('Backend check failed:', err);
      }
    };
    
    checkBackend();
    // Check every 5 seconds
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = (data) => {
    setFileId(data.file_id);
    setError(null);
    localStorage.setItem('current_file_id', data.file_id);
  };

  const handleUploadError = (err) => {
    setError(err);
    setFileId(null);
  };

  return (
    <>
      <Head>
        <title>Upload Resume - AI Resume Analyzer</title>
      </Head>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="header-section">
            <div className="header-icon">📤</div>
            <h1>Upload Your Resume</h1>
            <p className="subtitle">Upload your resume as PDF or image (PNG/JPEG) to get started</p>
          </div>

          {/* Backend Status Indicator */}
          {backendStatus === 'offline' && (
            <div className="backend-warning">
              <span className="warning-icon">⚠️</span>
              <div>
                <strong>Backend server is not running!</strong>
                <p>Please start the backend server:</p>
                <code>cd backend && uvicorn app.main:app --reload</code>
              </div>
            </div>
          )}

          {backendStatus === 'checking' && (
            <div className="backend-checking">
              <span className="checking-icon">🔄</span>
              <p>Checking backend connection...</p>
            </div>
          )}

          {backendStatus === 'online' && (
            <div className="backend-online">
              <span className="online-icon">✅</span>
              <p>Backend server is running</p>
            </div>
          )}

          <div className="upload-section">
            <Uploader
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              loading={loading}
              setLoading={setLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <div>
                <strong>Upload Error:</strong>
                <p>{error}</p>
                {error.includes('Cannot connect') && (
                  <div className="troubleshooting">
                    <p><strong>Troubleshooting:</strong></p>
                    <ul>
                      <li>Make sure the backend server is running on port 8000</li>
                      <li>Check if the API URL is correct: {API_BASE}</li>
                      <li>Verify there are no firewall or network issues</li>
                      <li>Check the browser console for more details</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {fileId && (
            <div className="success-message">
              <div className="success-header">
                <span className="success-icon">✅</span>
                <h3>File Uploaded Successfully!</h3>
              </div>
              <p className="file-id">File ID: <code>{fileId}</code></p>
              <div className="action-buttons">
                <button onClick={() => router.push('/notes')} className="action-btn btn-notes">
                  📝 Generate Notes
                </button>
                <button onClick={() => router.push('/flashcards')} className="action-btn btn-flashcards">
                  🎴 Create Flashcards
                </button>
                <button onClick={() => router.push('/quiz')} className="action-btn btn-quiz">
                  ❓ Take Quiz
                </button>
              </div>
            </div>
          )}

          <div className="back-link">
            <button onClick={() => router.push('/')} className="back-btn">
              ← Back to Home
            </button>
          </div>
        </div>

        <style jsx>{`
          .page-container {
            min-height: 100vh;
            padding: 2rem;
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }

          .content-wrapper {
            max-width: 900px;
            width: 100%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 3rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .header-section {
            text-align: center;
            margin-bottom: 3rem;
          }

          .header-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: float 3s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .header-section h1 {
            font-family: 'Poppins', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .subtitle {
            font-size: 1.1rem;
            color: #666;
          }

          .backend-warning {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            border-radius: 12px;
            color: white;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
          }

          .backend-checking {
            margin-bottom: 2rem;
            padding: 1rem;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            border-radius: 12px;
            color: white;
            display: flex;
            align-items: center;
            gap: 1rem;
            text-align: center;
            justify-content: center;
          }

          .backend-online {
            margin-bottom: 2rem;
            padding: 1rem;
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            border-radius: 12px;
            color: white;
            display: flex;
            align-items: center;
            gap: 1rem;
            text-align: center;
            justify-content: center;
          }

          .warning-icon, .checking-icon, .online-icon {
            font-size: 2rem;
          }

          .backend-warning code {
            display: block;
            background: rgba(255, 255, 255, 0.2);
            padding: 0.5rem;
            border-radius: 4px;
            margin-top: 0.5rem;
            font-family: monospace;
          }

          .upload-section {
            margin: 2rem 0;
          }

          .error-message {
            margin-top: 2rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            border-radius: 12px;
            color: white;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
          }

          .error-icon {
            font-size: 2rem;
          }

          .error-message p {
            margin: 0.5rem 0;
          }

          .troubleshooting {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
          }

          .troubleshooting ul {
            margin: 0.5rem 0 0 1.5rem;
            padding: 0;
          }

          .troubleshooting li {
            margin: 0.5rem 0;
          }

          .success-message {
            margin-top: 2rem;
            padding: 2rem;
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            border-radius: 16px;
            color: white;
            box-shadow: 0 4px 15px rgba(67, 233, 123, 0.3);
          }

          .success-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .success-icon {
            font-size: 2rem;
          }

          .success-header h3 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
          }

          .file-id {
            margin: 1rem 0;
            font-size: 0.9rem;
          }

          .file-id code {
            background: rgba(255, 255, 255, 0.3);
            padding: 0.3rem 0.6rem;
            border-radius: 6px;
            font-weight: 600;
          }

          .action-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
            flex-wrap: wrap;
          }

          .action-btn {
            flex: 1;
            min-width: 150px;
            padding: 1rem 1.5rem;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }

          .btn-notes {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .btn-flashcards {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          .btn-quiz {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          .action-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          }

          .back-link {
            margin-top: 2rem;
            text-align: center;
          }

          .back-btn {
            padding: 0.75rem 2rem;
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            border: 2px solid #667eea;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .back-btn:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
          }

          @media (max-width: 768px) {
            .content-wrapper {
              padding: 2rem 1.5rem;
            }

            .header-section h1 {
              font-size: 2rem;
            }

            .action-buttons {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </>
  );
}
