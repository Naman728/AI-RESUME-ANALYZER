export default function QuizQuestion({ question, questionIndex, selectedAnswer, onAnswer, showResult, result }) {
  const options = ['A', 'B', 'C', 'D'];

  const handleOptionClick = (optionIndex) => {
    if (!showResult) {
      onAnswer(questionIndex, question.options[optionIndex]);
    }
  };

  const getOptionClass = (optionIndex) => {
    if (!showResult) {
      return selectedAnswer === question.options[optionIndex] ? 'option selected' : 'option';
    }

    // Show results
    if (optionIndex === question.correct_answer) {
      return 'option correct';
    }
    if (selectedAnswer === question.options[optionIndex] && optionIndex !== question.correct_answer) {
      return 'option incorrect';
    }
    return 'option';
  };

  return (
    <div className="quiz-question">
      <div className="question-header">
        <h3>{question.question}</h3>
      </div>
      <div className="options">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={getOptionClass(index)}
            onClick={() => handleOptionClick(index)}
          >
            <div className="option-badge">{options[index]}</div>
            <span className="option-text">{option}</span>
            {showResult && index === question.correct_answer && (
              <span className="correct-icon">✓</span>
            )}
            {showResult && selectedAnswer === question.options[index] && index !== question.correct_answer && (
              <span className="incorrect-icon">✗</span>
            )}
          </div>
        ))}
      </div>
      {showResult && result && (
        <div className={`result ${result.is_correct ? 'correct' : 'incorrect'}`}>
          <div className="result-header">
            <span className="result-icon">{result.is_correct ? '🎉' : '💡'}</span>
            <strong>{result.is_correct ? 'Correct!' : 'Incorrect'}</strong>
          </div>
          <p>{result.feedback}</p>
          {question.explanation && (
            <div className="explanation">
              <strong>💡 Explanation:</strong>
              <p>{question.explanation}</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .quiz-question {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .question-header {
          margin-bottom: 2rem;
        }

        .question-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.4rem;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          line-height: 1.5;
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .option {
          display: flex;
          align-items: center;
          padding: 1.25rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          position: relative;
        }

        .option:hover:not(.correct):not(.incorrect) {
          border-color: #4facfe;
          background: linear-gradient(135deg, rgba(79, 172, 254, 0.05) 0%, rgba(0, 242, 254, 0.05) 100%);
          transform: translateX(5px);
        }

        .option.selected {
          border-color: #4facfe;
          background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%);
          box-shadow: 0 4px 15px rgba(79, 172, 254, 0.2);
        }

        .option.correct {
          border-color: #43e97b;
          background: linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%);
          box-shadow: 0 4px 15px rgba(67, 233, 123, 0.2);
        }

        .option.incorrect {
          border-color: #ff6b6b;
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 111, 0.1) 100%);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
        }

        .option-badge {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1.1rem;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .option.selected .option-badge {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .option.correct .option-badge {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .option.incorrect .option-badge {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        }

        .option-text {
          flex: 1;
          color: #333;
          font-size: 1rem;
          font-weight: 500;
        }

        .correct-icon, .incorrect-icon {
          font-size: 1.5rem;
          margin-left: auto;
        }

        .correct-icon {
          color: #43e97b;
        }

        .incorrect-icon {
          color: #ff6b6b;
        }

        .result {
          margin-top: 2rem;
          padding: 1.5rem;
          border-radius: 16px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .result.correct {
          background: linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%);
          border: 2px solid #43e97b;
          color: #2e7d32;
        }

        .result.incorrect {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 111, 0.1) 100%);
          border: 2px solid #ff6b6b;
          color: #c62828;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .result-icon {
          font-size: 1.5rem;
        }

        .result p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        .explanation {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid rgba(0, 0, 0, 0.1);
        }

        .explanation p {
          margin: 0.5rem 0 0 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
