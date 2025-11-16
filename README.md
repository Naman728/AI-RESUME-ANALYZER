# AI Resume Analyzer & Generator

A full-stack application that uses AI to analyze resumes, generate study materials (notes, flashcards, quizzes), and create ATS-friendly resumes.

## Features

- **Resume Upload**: Upload PDF or image files (PNG/JPEG) with OCR support
- **AI-Generated Notes**: Get concise notes summarizing your resume
- **Flashcards**: Create interactive flashcards to study resume content
- **Quiz Generator**: Generate multiple-choice quizzes based on your resume
- **Resume Generator**: Create ATS-friendly resumes from your information
- **ATS Analysis**: Analyze resume compatibility with job descriptions

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **OpenAI API**: For LLM and embeddings generation
- **Pytesseract**: OCR for image and PDF text extraction
- **PyPDF2 & pdf2image**: PDF processing
- **In-memory Vector Store**: For similarity search (can be replaced with Chroma/Pinecone)

### Frontend
- **Next.js 14**: React framework
- **React**: UI library
- **CSS-in-JS**: Styled components

## Project Structure

```
ai-resume-app/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── api/                  # API route handlers
│   │   │   ├── upload.py
│   │   │   ├── notes.py
│   │   │   ├── flashcards.py
│   │   │   ├── quiz.py
│   │   │   ├── generator.py
│   │   │   └── ats.py
│   │   ├── core/                 # Core configuration
│   │   │   ├── config.py
│   │   │   └── logger.py
│   │   ├── models/               # Data models
│   │   │   ├── llm_client.py    # LLM abstraction layer
│   │   │   └── schemas.py       # Pydantic models
│   │   ├── services/             # Business logic
│   │   │   ├── parser.py        # PDF/OCR parsing
│   │   │   ├── chunker.py       # Text chunking
│   │   │   ├── embeddings.py    # Embeddings generation
│   │   │   ├── vectorstore.py   # Vector database
│   │   │   ├── notes_service.py
│   │   │   ├── flashcard_service.py
│   │   │   ├── quiz_service.py
│   │   │   └── generator_service.py
│   │   └── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── pages/                    # Next.js pages
│   │   ├── index.js
│   │   ├── upload.js
│   │   ├── notes.js
│   │   ├── flashcards.js
│   │   ├── quiz.js
│   │   └── generate.js
│   ├── components/               # React components
│   │   ├── Uploader.jsx
│   │   ├── Flashcard.jsx
│   │   ├── QuizQuestion.jsx
│   │   └── ResumePreview.jsx
│   ├── styles/
│   │   └── global.css
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- Tesseract OCR (for image/PDF text extraction)
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd ai-resume-app/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r app/requirements.txt
```

4. Install Tesseract OCR:
   - **macOS**: `brew install tesseract`
   - **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`
   - **Windows**: Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)

5. Create a `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
EMBEDDING_MODEL=text-embedding-3-small
VECTOR_STORE_PATH=./vector_store
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=10
```

6. Run the backend server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ai-resume-app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Upload
- `POST /api/upload` - Upload a resume file (PDF or image)

### Notes
- `POST /api/notes` - Generate short notes from uploaded resume

### Flashcards
- `POST /api/flashcards` - Generate flashcards from resume

### Quiz
- `POST /api/quiz` - Generate quiz questions
- `POST /api/quiz/evaluate` - Evaluate quiz answers

### Generator
- `POST /api/generate` - Generate an ATS-friendly resume

### ATS Analysis
- `POST /api/ats` - Analyze resume for ATS compatibility

## Usage

1. **Upload Resume**: Go to `/upload` and upload your resume (PDF or image)
2. **Generate Notes**: Navigate to `/notes` and generate concise notes
3. **Create Flashcards**: Visit `/flashcards` to create study flashcards
4. **Take Quiz**: Go to `/quiz` to test your knowledge
5. **Generate Resume**: Use `/generate` to create a new ATS-friendly resume
6. **ATS Analysis**: Use the ATS endpoint to analyze resume compatibility

## Docker Deployment

### Backend

Build and run the backend container:
```bash
cd ai-resume-app/backend
docker build -t ai-resume-backend .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key ai-resume-backend
```

## Configuration

Key configuration options in `backend/app/core/config.py`:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: LLM model to use (default: gpt-3.5-turbo)
- `EMBEDDING_MODEL`: Embedding model (default: text-embedding-3-small)
- `CHUNK_SIZE`: Text chunk size for embeddings (default: 1000)
- `CHUNK_OVERLAP`: Overlap between chunks (default: 200)
- `MAX_UPLOAD_MB`: Maximum file upload size (default: 10MB)

## Notes

- The vector store is currently in-memory. For production, consider using Chroma, Pinecone, or Weaviate
- OCR quality depends on image quality and Tesseract installation
- OpenAI API usage will incur costs based on your usage
- File uploads are stored locally in the `uploads` directory

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

