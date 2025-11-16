import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import QuizQuestion from '../components/QuizQuestion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileId, setFileId] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const router = useRouter();

  useEffect(() => {
    const storedFileId = localStorage.getItem('current_file_id');
    if (storedFileId) {
      setFileId(storedFileId);
    }
  }, []);

  const generateQuiz = async () => {
    if (!fileId) {
      setError('Please upload a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setShowResults(false);
    setAnswers({});
    setResults({});

    try {
      const response = await fetch(`${API_BASE}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          count: count,
          difficulty: difficulty,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate quiz');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, selectedOption) => {
    setAnswers({
      ...answers,
      [questionIndex]: selectedOption,
    });
  };

  const evaluateQuiz = async () => {
    setLoading(true);
    const newResults = {};

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = answers[i];
      const correctAnswer = question.options[question.correct_answer];

      try {
        const response = await fetch(`${API_BASE}/quiz/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: question.question,
            user_answer: userAnswer || '',
            correct_answer: correctAnswer,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          newResults[i] = data;
        }
      } catch (err) {
        console.error('Error evaluating answer:', err);
      }
    }

    setResults(newResults);
    setShowResults(true);
    setLoading(false);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const score = showResults
    ? Object.values(results).filter((r) => r.is_correct).length
    : null;
  const totalScore = questions.length;
  const percentage = score !== null ? ((score / totalScore) * 100).toFixed(1) : 0;

  return (
    <>
      <Head>
        <title>Quiz - AI Resume Analyzer</title>
      </Head>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="header-section">
            <div className="header-icon">❓</div>
            <h1>Quiz Generator</h1>
            <p className="subtitle">Test your knowledge with AI-generated quiz questions</p>
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
                onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                min="1"
                max="20"
                className="input"
              />
            </div>
            <div className="input-group small">
              <label>Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button onClick={generateQuiz} disabled={loading} className="generate-btn">
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Generating...
                </>
              ) : (
                <>✨ Generate Quiz</>
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

          {questions.length > 0 && (
            <div className="quiz-container">
              {showResults && (
                <div className="score-card">
                  <div className="score-icon">{percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪'}</div>
                  <h2>Your Score</h2>
                  <div className="score-value">
                    <span className="score-number">{score}</span>
                    <span className="score-total">/ {totalScore}</span>
                  </div>
                  <div className="score-percentage">{percentage}%</div>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="question-header">
                <span className="question-counter">Question {currentIndex + 1} of {questions.length}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <QuizQuestion
                question={questions[currentIndex]}
                questionIndex={currentIndex}
                selectedAnswer={answers[currentIndex]}
                onAnswer={handleAnswer}
                showResult={showResults}
                result={results[currentIndex]}
              />

              <div className="navigation">
                <button onClick={prevQuestion} disabled={currentIndex === 0} className="nav-button">
                  ← Previous
                </button>
                {!showResults && (
                  <button
                    onClick={evaluateQuiz}
                    disabled={Object.keys(answers).length !== questions.length || loading}
                    className="nav-button primary"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-small"></span>
                        Evaluating...
                      </>
                    ) : (
                      <>✅ Submit Quiz</>
                    )}
                  </button>
                )}
                <button onClick={nextQuestion} disabled={currentIndex === questions.length - 1} className="nav-button">
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
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
            width: 150px;
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
            border-color: #4facfe;
            box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
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
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
          }

          .generate-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6);
          }

          .generate-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .secondary-btn {
            background: white;
            color: #4facfe;
            border: 2px solid #4facfe;
          }

          .secondary-btn:hover {
            background: #4facfe;
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

          .quiz-container {
            margin-top: 3rem;
          }

          .score-card {
            text-align: center;
            padding: 3rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            color: white;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
          }

          .score-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .score-card h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 1.8rem;
            margin: 0 0 1rem 0;
            font-weight: 700;
          }

          .score-value {
            font-size: 3rem;
            font-weight: 800;
            margin: 1rem 0;
          }

          .score-number {
            color: #fff;
          }

          .score-total {
            font-size: 2rem;
            opacity: 0.8;
          }

          .score-percentage {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 1rem 0;
          }

          .score-bar {
            width: 100%;
            height: 12px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            overflow: hidden;
            margin-top: 1.5rem;
          }

          .score-fill {
            height: 100%;
            background: white;
            transition: width 0.5s ease;
            border-radius: 6px;
          }

          .question-header {
            margin-bottom: 2rem;
          }

          .question-counter {
            display: block;
            text-align: center;
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
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .nav-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(67, 233, 123, 0.6);
          }

          .nav-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .nav-button.primary {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);
          }

          .nav-button.primary:hover:not(:disabled) {
            box-shadow: 0 6px 20px rgba(250, 112, 154, 0.6);
          }

          .back-link {
            margin-top: 2rem;
            text-align: center;
          }

          .back-btn {
            padding: 0.75rem 2rem;
            background: rgba(79, 172, 254, 0.1);
            color: #4facfe;
            border: 2px solid #4facfe;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .back-btn:hover {
            background: #4facfe;
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
