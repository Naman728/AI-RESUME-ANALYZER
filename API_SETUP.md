# API Setup Guide

## Fixed Issues

I've improved the backend APIs for flashcards, quiz, and notes generation. Here's what was fixed:

### 1. **Better Error Handling**
- Clear error messages when OpenAI API key is missing
- Fallback mechanisms if embeddings fail
- Better JSON parsing for LLM responses

### 2. **Vector Store Improvements**
- Documents are now stored even if embeddings fail
- Services can work with text-only documents

### 3. **LLM Client Improvements**
- Better JSON parsing (handles markdown code blocks)
- Clearer error messages for API key issues
- Enhanced prompts for better JSON output

## Required Configuration

### Step 1: Set OpenAI API Key

Create or edit `.env` file in the `backend` directory:

```bash
cd "/Users/namananand/AI RESUME MAKER/ai-resume-app/backend"
nano .env
```

Add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
EMBEDDING_MODEL=text-embedding-3-small
```

### Step 2: Restart Backend Server

After setting the API key, restart your backend:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
uvicorn app.main:app --reload
```

## Testing the APIs

### 1. Upload a Resume First

Before generating flashcards/quiz/notes, you must upload a resume:

```bash
# Use the upload page in the frontend
# Or test with curl:
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@/path/to/your/resume.pdf"
```

Save the `file_id` from the response.

### 2. Test Notes API

```bash
curl -X POST "http://localhost:8000/api/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "your-file-id-here",
    "style": "concise"
  }'
```

### 3. Test Flashcards API

```bash
curl -X POST "http://localhost:8000/api/flashcards" \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "your-file-id-here",
    "count": 10
  }'
```

### 4. Test Quiz API

```bash
curl -X POST "http://localhost:8000/api/quiz" \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "your-file-id-here",
    "count": 5,
    "difficulty": "medium"
  }'
```

## Common Issues & Solutions

### Issue: "OpenAI API key not configured"

**Solution:**
1. Create `.env` file in `backend` directory
2. Add `OPENAI_API_KEY=sk-your-key-here`
3. Restart the backend server

### Issue: "No documents found for file_id"

**Solution:**
1. Make sure you uploaded a file first
2. Use the `file_id` from the upload response
3. Check backend logs to see if upload was successful

### Issue: "Invalid JSON response from LLM"

**Solution:**
1. Check your OpenAI API key is valid
2. Check you have credits in your OpenAI account
3. Try again - sometimes LLM responses need retry

### Issue: APIs work but return empty results

**Solution:**
1. Check the uploaded resume has readable text
2. Try with a different resume file
3. Check backend logs for detailed error messages

## Debugging

### Check Backend Logs

The backend logs will show:
- If documents were stored successfully
- If embeddings were generated
- If LLM calls succeeded
- Detailed error messages

### Test API Health

```bash
curl http://localhost:8000/api/health
```

### Check if File was Uploaded

The file should be in `backend/uploads/` directory and the text should be in the vector store.

## Next Steps

1. ✅ Set OpenAI API key in `.env`
2. ✅ Restart backend server
3. ✅ Upload a resume
4. ✅ Try generating notes/flashcards/quiz

If you still have issues, check the backend terminal for detailed error messages!

