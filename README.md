# InsightLab — AI Market Research Agent

Turn business questions into actionable market insights with a multi-agent AI system that researches the web, analyzes competitors, and generates polished PDF reports.

InsightLab uses three specialized AI agents working sequentially to transform user requirements into structured, client-facing market research reports.

## Overview

Market research often involves searching multiple sources, comparing competitors, identifying market trends, and compiling findings into a professional report. InsightLab automates this workflow through a coordinated team of AI agents.

Users describe their research requirements through a React chat interface. The backend gathers web research, drafts the report, refines the content, and returns a downloadable PDF.

### Key Features

- **AI-powered market research** — Gather information about industries, market trends, products, and competitors.
- **Competitor analysis** — Investigate competitor positioning, offerings, pricing, and differentiators using available web sources.
- **Multi-agent workflow** — Separate research, writing, and editing responsibilities across three specialized agents.
- **Web search through MCP** — Connect the research agent to Brave Search through the Model Context Protocol.
- **Professional PDF reports** — Generate downloadable reports from the final edited content.
- **Chat-based interface** — Submit research requirements through a responsive React frontend.
- **Source-aware reporting** — Preserve source URLs and distinguish verified facts from estimates or unavailable information.

## Architecture

```text
                  User
                   |
                   v
        React + Vite Frontend
                   |
             HTTP / REST API
                   |
                   v
           FastAPI Backend
                   |
                   v
          Sequential Workflow
                   |
          +--------+--------+
          |                 |
          v                 |
    Research Agent          |
          |                 |
          v                 |
    Brave Search MCP        |
          |                 |
          v                 |
    Research Findings       |
          |                 |
          v                 |
     Report Writer          |
          |                 |
          v                 |
       Draft Report         |
          |                 |
          v                 |
        Editor              |
          |                 |
          v                 |
      Final Report          |
          |                 |
          v                 |
    ReportLab PDF Generator |
          |                 |
          v                 |
     Downloadable PDF <-----+
```

### Agent Responsibilities

| Agent | Responsibility |
|---|---|
| Research Agent | Searches the web, collects evidence, investigates competitors, and gathers source URLs. |
| Report Writer | Organizes the research into a structured report with findings, comparisons, and recommendations. |
| Editor | Improves clarity, structure, consistency, and professional tone while preserving evidence and caveats. |

### Orchestration Pattern

InsightLab implements **sequential orchestration**.

Each agent completes its task before the next agent starts. The workflow is coordinated by the `generate_report()` function in `agents.py`.

Agent communication uses direct data passing through Python variables:

1. The Research Agent returns research findings.
2. The findings are passed into the Report Writer's prompt.
3. The Report Writer returns a draft.
4. The draft is passed into the Editor's prompt.
5. The final edited report is converted into a PDF.

The current implementation does not use a shared state store, message queue, or persistent agent memory.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, custom CSS |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| Agent framework | smolagents |
| Language model | Google Gemini through LiteLLM |
| Web search | Brave Search MCP |
| MCP integration | Model Context Protocol |
| PDF generation | ReportLab |
| Configuration | python-dotenv |

## Project Structure

```text
market-research-agent/
├── app.py                 # FastAPI application and API endpoints
├── agents.py              # Agent definitions and orchestration
├── pdf_generator.py       # PDF report generation
├── requirements.txt       # Python dependencies
├── .env.example           # Environment variable template
├── .gitignore
├── reports/               # Generated PDF reports
└── client/
    ├── src/
    │   ├── App.tsx        # Main React application
    │   ├── index.css      # Application styles
    │   └── main.tsx       # React entry point
    ├── index.html
    ├── package.json
    └── vite.config.ts     # Vite configuration and API proxy
```

## Prerequisites

Before running the project, ensure you have:

- Python 3.12
- Node.js and npm
- A Google Gemini API key
- A Brave Search API key
- The Brave Search MCP server available through `npx`

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mewsxd/market-research-agent.git
cd market-research-agent
```

### 2. Set up the Python environment

Create and activate a virtual environment.

**Windows PowerShell:**

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```powershell
python -m pip install -r requirements.txt
```

If you do not yet have a `requirements.txt`, install the packages used by the backend:

```powershell
python -m pip install "smolagents[mcp,litellm]" litellm fastapi uvicorn reportlab python-dotenv
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
BRAVE_API_KEY=your_brave_api_key
```

Get your API keys from:

- [Google AI Studio](https://aistudio.google.com/apikey)
- [Brave Search API](https://brave.com/search/api/)

Never commit `.env` or expose API keys in the frontend.

### 4. Start the Brave Search MCP server

The backend must be configured to use the same MCP transport and address as the running server.

For the HTTP transport configuration, start the server in a separate terminal:

```powershell
$env:BRAVE_API_KEY = "your_brave_api_key"
npx -y @brave/brave-search-mcp-server --transport http --port 8080
```

Keep the MCP server running while using the application.

The Python backend must connect to the HTTP MCP endpoint configured in `app.py`. If you use a different transport or endpoint, update the server and client configurations to match.

### 5. Start the backend

From the project root, with the virtual environment activated:

```powershell
uvicorn app:app --reload --port 8000
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Check the health endpoint:

```text
http://127.0.0.1:8000/api/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### 6. Start the frontend

Open a separate terminal:

```powershell
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

The frontend's Vite proxy should forward `/api` requests to `http://127.0.0.1:8000`.

## API Endpoints

### Health Check

`GET /api/health`

Checks whether the FastAPI application is responding.

**Example response:**

```json
{
  "status": "ok"
}
```

### Generate a Research Report

`POST /api/research`

Accepts research requirements and returns a generated PDF.

**Request body:**

```json
{
  "requirements": "Analyze the premium bakery market in Mumbai, compare competitors, evaluate pricing and positioning, and identify opportunities for a new brand."
}
```

**Successful response:** A PDF file returned as `application/pdf`.

The response includes a filename in the `Content-Disposition` header so the frontend can offer the report as a download.

## Example Use Cases

### Premium Bakery Market Research

Investigate premium bakeries in Mumbai, including Cremure, Magnolia Bakery, and Dessert Therapy. Compare product ranges, publicly available prices, positioning, locations, customer feedback, and potential market gaps.

### SaaS Competitor Analysis

Compare competing software products by features, pricing, target customers, market positioning, and differentiation.

### Industry Opportunity Research

Investigate a target industry, identify emerging trends, analyze customer needs, and recommend potential business opportunities.

## Report Structure

The agents are instructed to produce reports containing:

1. Executive summary
2. Research scope and methodology
3. Market overview and trends
4. Target customer analysis
5. Competitor analysis
6. Competitive comparison
7. Market opportunities and risks
8. Strategic recommendations
9. Sources and references

The actual report content depends on the user's requirements and the evidence available through web search.

## Current Limitations

- **Research coverage:** Search depth depends on available tools, agent step limits, and the quality of retrieved sources.
- **Source verification:** Source URLs are preserved, but claims are not guaranteed to have been independently verified.
- **Sequential execution:** Agents run one after another, which can increase the time required for complex reports.
- **No