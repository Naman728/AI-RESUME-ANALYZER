import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function NotesPage() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileId, setFileId] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedFileId = localStorage.getItem('current_file_id');
    if (storedFileId) {
      setFileId(storedFileId);
    }
  }, []);

  const generateNotes = async () => {
    if (!fileId) {
      setError('Please upload a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          style: 'concise',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate notes');
      }

      const data = await response.json();
      setNotes(data.notes);
    } catch (err) {
      setError(err.message || 'Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Generate Notes - AI Resume Analyzer</title>
      </Head>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="header-section">
            <div className="header-icon">📝</div>
            <h1>Generate Notes</h1>
            <p className="subtitle">Get AI-generated concise notes from your uploaded resume</p>
          </div>

          <div className="controls">
            <div className="input-group">
              <label>File ID</label>
              <input
                type="text"
                placeholder="File ID (or use uploaded file)"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
                className="input"
              />
            </div>
            <button onClick={generateNotes} disabled={loading} className="generate-btn">
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Generating...
                </>
              ) : (
                <>
                  ✨ Generate Notes
                </>
              )}
            </button>
            <button onClick={() => router.push('/upload')} className="secondary-btn">
              📤 Upload New File
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {notes && (
            <div className="notes-container">
              <div className="notes-header">
                <h2>📋 Generated Notes</h2>
                <button onClick={() => navigator.clipboard.writeText(notes)} className="copy-btn">
                  📋 Copy
                </button>
              </div>
              <div className="notes-content">
                {notes.split('\n').map((line, idx) => (
                  <p key={idx}>{line || '\u00A0'}</p>
                ))}
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
            max-width: 1000px;
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

          .controls {
            display: flex;
            gap: 1rem;
            margin: 2rem 0;
            flex-wrap: wrap;
            align-items: flex-end;
          }

          .input-group {
            flex: 1;
            min-width: 200px;
          }

          .input-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
          }

          .input {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: white;
          }

          .input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .generate-btn, .secondary-btn {
            padding: 1rem 2rem;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .generate-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }

          .generate-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }

          .generate-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .secondary-btn {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
          }

          .secondary-btn:hover {
            background: #667eea;
            color: white;
          }

          .spinner-small {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .error-message {
            margin-top: 1rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            border-radius: 12px;
            color: white;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
          }

          .error-icon {
            font-size: 2rem;
          }

          .notes-container {
            margin-top: 2rem;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          }

          .notes-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .notes-header h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 1.8rem;
            color: #333;
            margin: 0;
          }

          .copy-btn {
            padding: 0.5rem 1rem;
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .copy-btn:hover {
            background: #667eea;
            color: white;
          }

          .notes-content {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            white-space: pre-wrap;
            line-height: 1.8;
            color: #555;
            max-height: 600px;
            overflow-y: auto;
          }

          .notes-content p {
            margin: 0.8rem 0;
            font-size: 1rem;
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

            .controls {
              flex-direction: column;
            }

            .input-group {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </>
  );
}
