#!/bin/bash

# Script to start the backend server

echo "🚀 Starting AI Resume Analyzer Backend..."
echo ""

cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r app/requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating one..."
    cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
EMBEDDING_MODEL=text-embedding-3-small
VECTOR_STORE_PATH=./vector_store
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=10
EOF
    echo "✅ Created .env file. Please add your OpenAI API key!"
fi

# Create necessary directories
mkdir -p uploads vector_store

# Start the server
echo ""
echo "✅ Starting server on http://localhost:8000"
echo "📝 API docs available at http://localhost:8000/docs"
echo ""
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

