# n8n Workflows

This directory contains the exported n8n workflows used by the BAföG Bot.

## How to use:
1. Open your self-hosted n8n instance.
2. Click on **Workflows > Import from File**.
3. Select the `.json` file in this directory.
4. Update the following nodes with your own credentials:
   - **Qdrant**: Your vector database URL and API key.
   - **OpenRouter/LLM**: Your AI provider credentials.
   - **Ollama**: Your local Ollama endpoint (usually `http://localhost:11434`).

## Note on Documents:
You will need to create a collection in Qdrant and populate it with BAföG-related documents (legislation, FAQs, etc.) to make the RAG pipeline functional.
