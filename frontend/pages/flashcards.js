import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Flashcard from '../components/Flashcard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileId, setFileId] = useState('');
  const [count, setCount] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const storedFileId = localStorage.getItem('current_file_id');
    if (storedFileId) {
      setFileId(storedFileId);
    }
  }, []);

  const generateFlashcards = async () => {
    if (!fileId) {
      setError('Please upload a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          count: count,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate flashcards');
      }

      const data = await response.json();
      setFlashcards(data.flashcards);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.message || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
      <Head>
        <title>Flashcards - AI Resume Analyzer</title>
      </Head>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="header-section">
            <div className="header-icon">🎴</div>
            <h1>Flashcards</h1>
            <p className="subtitle">Generate flashcards to study your resume content</p>
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
            <div className="input-group small">
              <label>Count</label>
              <input
                type="number"
                placeholder="Count"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 10)}
                min="1"
                max="50"
                className="input"
              />
            </div>
            <button onClick={generateFlashcards} disabled={loading} className="generate-btn">
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Generating...
                </>
              ) : (
                <>✨ Generate Flashcards</>
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

          {flashcards.length > 0 && (
            <div className="flashcards-container">
              <div className="card-info">
                <span className="card-counter">Card {currentIndex + 1} of {flashcards.length}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <Flashcard
                front={flashcards[currentIndex].front}
                back={flashcards[currentIndex].back}
              />
              <div className="navigation">
                <button onClick={prevCard} disabled={currentIndex === 0} className="nav-button">
                  ← Previous
                </button>
                <button onClick={nextCard} disabled={currentIndex === flashcards.length - 1} className="nav-button">
                  Next →
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
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

          .input-group.small {
            flex: 0;
            width: 120px;
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
            border-color: #f093fb;
            box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
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
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
          }

          .generate-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
          }

          .generate-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .secondary-btn {
            background: white;
            color: #f5576c;
            border: 2px solid #f5576c;
          }

          .secondary-btn:hover {
            background: #f5576c;
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

          .flashcards-container {
            margin-top: 3rem;
          }

          .card-info {
            text-align: center;
            margin-bottom: 2rem;
          }

          .card-counter {
            display: block;
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 0.5rem;
          }

          .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 0.5rem;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            transition: width 0.3s ease;
            border-radius: 4px;
          }

          .navigation {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
          }

          .nav-button {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
          }

          .nav-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6);
          }

          .nav-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .back-link {
            margin-top: 2rem;
            text-align: center;
          }

          .back-btn {
            padding: 0.75rem 2rem;
            background: rgba(240, 147, 251, 0.1);
            color: #f5576c;
            border: 2px solid #f5576c;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .back-btn:hover {
            background: #f5576c;
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
