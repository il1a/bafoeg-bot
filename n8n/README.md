# n8n Workflows

This directory contains the exported n8n workflow used by the BAföG Bot RAG pipeline.

## Included Files

| File | Description |
|------|-------------|
| `BAföG Bot - Version for User Testing v4.json` | Main RAG workflow with Qdrant search, calculator tool, and OpenRouter LLM integration |

## How to Import

1. Open your self-hosted n8n instance
2. Click **Workflows → Import from File**
3. Select the `.json` file
4. Update the following nodes with your own credentials:
   - **Qdrant**: Vector database URL and API key
   - **OpenRouter**: Your API Key (ZDR possible, see [OpenRouter ZDR](https://openrouter.ai/docs/guides/features/zdr/))
   - **Ollama**: Your local embedding endpoint (default: `http://localhost:11434`)

## Architecture Overview

```
User Message
    │
    ▼
┌─────────────────┐
│  n8n Workflow   │
│  (this file)    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐  ┌──────────┐
│Qdrant │  │Calculator│
│ (RAG) │  │  (Math)  │
└───┬───┘  └────┬─────┘
    │           │
    └─────┬─────┘
          ▼
    ┌───────────┐
    │ OpenRouter│
    │(GPT-OSS)  │
    └─────┬─────┘
          ▼
    Bot Response
```

## Required Infrastructure

| Component | Purpose | Hosting |
|-----------|---------|---------|
| **n8n** | Workflow orchestration | Self-hosted (Docker) |
| **Qdrant** | Vector database for RAG | Self-hosted (Docker) |
| **Ollama** | BGE M3 embeddings | Self-hosted (Docker) |
| **OpenRouter** | LLM inference (ZDR) | Cloud API |

## Knowledge Base Setup

You will need to create a Qdrant collection and populate it with BAföG-related documents:

1. **Law sources**: BAföG paragraphs (from gesetze-im-internet.de)
2. **Webpage sources**: Official bafög.de content (FAQs, examples, guides)

## Tools Exposed to LLM

1. **Qdrant Search** — Retrieves relevant BAföG knowledge chunks
2. **Calculator** — Performs arithmetic for income/threshold calculations

Both tools show their inputs in the UI for user verification (transparency).

## Related Documentation

- [System Prompt](../docs/SYSTEM_PROMPT.md) — Complete LLM instructions
- [Main README](../README.md) — Project overview
