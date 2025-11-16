import { useState } from 'react';

export default function Flashcard({ front, back }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        <div className="flashcard-front">
          <div className="flashcard-content">
            <div className="card-label">Question</div>
            <h3>{front}</h3>
            <div className="hint">👆 Click to reveal answer</div>
          </div>
        </div>
        <div className="flashcard-back">
          <div className="flashcard-content">
            <div className="card-label">Answer</div>
            <h3>{back}</h3>
            <div className="hint">👆 Click to flip back</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .flashcard-container {
          perspective: 1000px;
          height: 450px;
          margin: 0 auto;
          cursor: pointer;
        }

        .flashcard {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .flashcard.flipped {
          transform: rotateY(180deg);
        }

        .flashcard-front,
        .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .flashcard-front {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .flashcard-back {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          transform: rotateY(180deg);
        }

        .flashcard-content {
          padding: 3rem;
          text-align: center;
          width: 100%;
        }

        .card-label {
          font-size: 0.9rem;
          font-weight: 600;
          opacity: 0.8;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .flashcard-content h3 {
          margin: 0;
          font-size: 1.5rem;
          line-height: 1.6;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
        }

        .hint {
          margin-top: 2.5rem;
          font-size: 0.9rem;
          opacity: 0.7;
          font-weight: 500;
        }

        .flashcard-container:hover .flashcard {
          transform: scale(1.02);
        }

        .flashcard-container:hover .flashcard.flipped {
          transform: rotateY(180deg) scale(1.02);
        }
      `}</style>
    </div>
  );
}
