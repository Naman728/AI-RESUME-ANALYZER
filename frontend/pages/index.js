import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Resume Analyzer & Generator</title>
        <meta name="description" content="Transform your resume with AI-powered analysis and generation" />
      </Head>
      <div className="container">
        <div className="hero">
          <div className="hero-content">
            <div className="logo">🚀</div>
            <h1>AI Resume Analyzer & Generator</h1>
            <p className="subtitle">Transform your resume with AI-powered analysis, study tools, and ATS-optimized generation</p>
            <div className="hero-buttons">
              <Link href="/upload" className="btn-primary">Get Started</Link>
              <Link href="/generate" className="btn-secondary">Generate Resume</Link>
            </div>
          </div>
        </div>

        <div className="features">
          <Link href="/upload" className="feature-card card-1">
            <div className="feature-icon">📄</div>
            <h2>Upload Resume</h2>
            <p>Upload your resume (PDF or image) for intelligent analysis and processing</p>
            <div className="feature-arrow">→</div>
          </Link>

          <Link href="/notes" className="feature-card card-2">
            <div className="feature-icon">📝</div>
            <h2>Generate Notes</h2>
            <p>Get AI-generated concise notes summarizing your resume content</p>
            <div className="feature-arrow">→</div>
          </Link>

          <Link href="/flashcards" className="feature-card card-3">
            <div className="feature-icon">🎴</div>
            <h2>Flashcards</h2>
            <p>Create interactive flashcards to study and memorize your resume details</p>
            <div className="feature-arrow">→</div>
          </Link>

          <Link href="/quiz" className="feature-card card-4">
            <div className="feature-icon">❓</div>
            <h2>Quiz Generator</h2>
            <p>Test your knowledge with AI-generated multiple-choice questions</p>
            <div className="feature-arrow">→</div>
          </Link>

          <Link href="/generate" className="feature-card card-5">
            <div className="feature-icon">✨</div>
            <h2>Resume Generator</h2>
            <p>Create ATS-friendly resumes optimized for applicant tracking systems</p>
            <div className="feature-arrow">→</div>
          </Link>
        </div>

        <div className="footer">
          <p>Built with ❤️ using Next.js & FastAPI</p>
        </div>

        <style jsx>{`
          .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            min-height: 100vh;
          }

          .hero {
            text-align: center;
            margin: 4rem 0 6rem 0;
            padding: 3rem 0;
          }

          .hero-content {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 4rem 2rem;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 800px;
            margin: 0 auto;
          }

          .logo {
            font-size: 5rem;
            margin-bottom: 1rem;
            animation: bounce 2s infinite;
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .hero h1 {
            font-family: 'Poppins', sans-serif;
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
          }

          .subtitle {
            font-size: 1.3rem;
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
          }

          .hero-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .btn-primary, .btn-secondary {
            padding: 1rem 2.5rem;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }

          .btn-secondary {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
          }

          .btn-secondary:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
          }

          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-bottom: 4rem;
          }

          .feature-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 2.5rem;
            border-radius: 20px;
            text-decoration: none;
            color: inherit;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }

          .feature-card:hover::before {
            transform: scaleX(1);
          }

          .feature-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }

          .card-1:hover { border-top: 4px solid #667eea; }
          .card-2:hover { border-top: 4px solid #f093fb; }
          .card-3:hover { border-top: 4px solid #4facfe; }
          .card-4:hover { border-top: 4px solid #43e97b; }
          .card-5:hover { border-top: 4px solid #fa709a; }

          .feature-icon {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            display: inline-block;
            transition: transform 0.3s ease;
          }

          .feature-card:hover .feature-icon {
            transform: scale(1.2) rotate(5deg);
          }

          .feature-card h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #333;
          }

          .feature-card p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 1rem;
          }

          .feature-arrow {
            position: absolute;
            bottom: 1.5rem;
            right: 1.5rem;
            font-size: 1.5rem;
            color: #667eea;
            transition: transform 0.3s ease;
          }

          .feature-card:hover .feature-arrow {
            transform: translateX(5px);
          }

          .footer {
            text-align: center;
            padding: 2rem;
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
          }

          @media (max-width: 768px) {
            .hero h1 {
              font-size: 2.5rem;
            }

            .subtitle {
              font-size: 1.1rem;
            }

            .features {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </>
  );
}
