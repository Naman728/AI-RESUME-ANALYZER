import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ResumePreview from '../components/ResumePreview';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function GeneratePage() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    summary: '',
    skills: '',
    template: 'modern',
    job_description: '',
  });
  const [experiences, setExperiences] = useState([{ title: '', company: '', duration: '', description: '' }]);
  const [education, setEducation] = useState([{ degree: '', institution: '', year: '' }]);
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperiences = [...experiences];
    newExperiences[index][field] = value;
    setExperiences(newExperiences);
  };

  const addExperience = () => {
    setExperiences([...experiences, { title: '', company: '', duration: '', description: '' }]);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const addEducation = () => {
    setEducation([...education, { degree: '', institution: '', year: '' }]);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const generateResume = async () => {
    setLoading(true);
    setError(null);

    try {
      const skillsList = formData.skills.split(',').map(s => s.trim()).filter(s => s);

      const payload = {
        name: formData.name || undefined,
        contact: formData.contact || undefined,
        summary: formData.summary || undefined,
        skills: skillsList.length > 0 ? skillsList : undefined,
        experiences: experiences.filter(exp => exp.title || exp.company).length > 0
          ? experiences.filter(exp => exp.title || exp.company)
          : undefined,
        education: education.filter(edu => edu.degree || edu.institution).length > 0
          ? education.filter(edu => edu.degree || edu.institution)
          : undefined,
        template: formData.template,
        job_description: formData.job_description || undefined,
      };

      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate resume');
      }

      const data = await response.json();
      setResume(data.resume);
    } catch (err) {
      setError(err.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Generate Resume - AI Resume Analyzer</title>
      </Head>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="header-section">
            <div className="header-icon">✨</div>
            <h1>Generate ATS-Friendly Resume</h1>
            <p className="subtitle">Fill in your information to generate a professional, ATS-optimized resume</p>
          </div>

          <div className="form-container">
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">👤</span>
                <h2>Basic Information</h2>
              </div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="input"
              />
              <input
                type="text"
                name="contact"
                placeholder="Email, Phone, LinkedIn"
                value={formData.contact}
                onChange={handleInputChange}
                className="input"
              />
              <textarea
                name="summary"
                placeholder="Professional Summary"
                value={formData.summary}
                onChange={handleInputChange}
                className="textarea"
                rows="4"
              />
              <input
                type="text"
                name="skills"
                placeholder="Skills (comma-separated)"
                value={formData.skills}
                onChange={handleInputChange}
                className="input"
              />
            </div>

            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">💼</span>
                <h2>Experience</h2>
              </div>
              {experiences.map((exp, index) => (
                <div key={index} className="item-card">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                    value={exp.duration}
                    onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                    className="input"
                  />
                  <textarea
                    placeholder="Description"
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    className="textarea"
                    rows="3"
                  />
                  {experiences.length > 1 && (
                    <button onClick={() => removeExperience(index)} className="remove-button">
                      🗑️ Remove
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addExperience} className="add-button">+ Add Experience</button>
            </div>

            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">🎓</span>
                <h2>Education</h2>
              </div>
              {education.map((edu, index) => (
                <div key={index} className="item-card">
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    className="input"
                  />
                  {education.length > 1 && (
                    <button onClick={() => removeEducation(index)} className="remove-button">
                      🗑️ Remove
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addEducation} className="add-button">+ Add Education</button>
            </div>

            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">⚙️</span>
                <h2>Additional Options</h2>
              </div>
              <select
                name="template"
                value={formData.template}
                onChange={handleInputChange}
                className="input"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
              </select>
              <textarea
                name="job_description"
                placeholder="Job Description (optional - for optimization)"
                value={formData.job_description}
                onChange={handleInputChange}
                className="textarea"
                rows="6"
              />
            </div>

            <button onClick={generateResume} disabled={loading} className="generate-button">
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Generating...
                </>
              ) : (
                <>✨ Generate Resume</>
              )}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {resume && <ResumePreview resume={resume} />}

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
            max-width: 1400px;
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
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .subtitle {
            font-size: 1.1rem;
            color: #666;
          }

          .form-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
          }

          .form-section {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          }

          .section-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
          }

          .section-icon {
            font-size: 1.5rem;
          }

          .form-section h2 {
            margin: 0;
            font-family: 'Poppins', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            color: #333;
          }

          .input,
          .textarea {
            width: 100%;
            padding: 1rem;
            margin-bottom: 1rem;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            font-size: 1rem;
            font-family: inherit;
            transition: all 0.3s ease;
            background: white;
          }

          .input:focus,
          .textarea:focus {
            outline: none;
            border-color: #fa709a;
            box-shadow: 0 0 0 3px rgba(250, 112, 154, 0.1);
          }

          .textarea {
            resize: vertical;
          }

          .item-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 1rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          }

          .add-button,
          .remove-button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-top: 0.5rem;
          }

          .add-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }

          .add-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          .remove-button {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
          }

          .remove-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
          }

          .generate-button {
            grid-column: 1 / -1;
            padding: 1.5rem 3rem;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: white;
            border: none;
            border-radius: 16px;
            cursor: pointer;
            font-size: 1.3rem;
            font-weight: 700;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(250, 112, 154, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .generate-button:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(250, 112, 154, 0.6);
          }

          .generate-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .spinner-small {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .error-message {
            margin-top: 2rem;
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

          .back-link {
            margin-top: 2rem;
            text-align: center;
          }

          .back-btn {
            padding: 0.75rem 2rem;
            background: rgba(250, 112, 154, 0.1);
            color: #fa709a;
            border: 2px solid #fa709a;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .back-btn:hover {
            background: #fa709a;
            color: white;
            transform: translateY(-2px);
          }

          @media (max-width: 768px) {
            .form-container {
              grid-template-columns: 1fr;
            }

            .content-wrapper {
              padding: 2rem 1.5rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}
