
import os
import re
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse
from smolagents import MCPClient

from agents import create_agents, generate_report
from pdf_generator import create_pdf

load_dotenv()


def safe_filename(text: str) -> str:
    name = re.sub(r"[^a-zA-Z0-9_-]+", "_", text)
    return (name[:50].strip("_") or "market_research") + "_report.pdf"


@asynccontextmanager
async def lifespan(app: FastAPI):
    api_key = os.getenv("BRAVE_API_KEY")

    if not api_key:
        raise RuntimeError("BRAVE_API_KEY is missing from .env")

    # server_parameters = StdioServerParameters(
    #     command="cmd",
    #     args=[
    #         "/c",
    #         "npx",
    #         "-y",
    #         "@brave/brave-search-mcp-server",
    #         "--transport",
    #         "stdio",
    #     ],
    #     env={
    #         **os.environ,
    #         "BRAVE_API_KEY": api_key,
    #     },
    # )

    # # Connect to MCP once when the API starts.
    # with MCPClient(server_parameters, structured_output=False,) as search_tools:
    #     app.state.agents = create_agents(search_tools)
    #     yield
    with MCPClient(
        {
            "url": "http://127.0.0.1:8080/mcp",
            "transport": "streamable-http",
        },
        structured_output=False,
    ) as search_tools:
        print("Connected MCP tools:", [tool.name for tool in search_tools])
        app.state.agents = create_agents(search_tools)
        yield


app = FastAPI(
    title="Market Research Agent API",
    lifespan=lifespan,
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/research")
async def research(payload: dict):
    requirements = payload.get("requirements", "")

    if not isinstance(requirements, str) or not requirements.strip():
        raise HTTPException(
            status_code=400,
            detail="Please provide research requirements.",
        )

    if len(requirements) > 10000:
        raise HTTPException(
            status_code=413,
            detail="Requirements must be under 10,000 characters.",
        )

    try:
        report = await run_in_threadpool(
            generate_report,
            requirements.strip(),
            app.state.agents,
        )

        filename = safe_filename(requirements[:60])
        filepath = await run_in_threadpool(
            create_pdf,
            report,
            filename,
        )

        return FileResponse(
            filepath,
            media_type="application/pdf",
            filename=filename,
        )

    except Exception as exc:
        # Log the full exception in the server terminal.
        import logging
        logging.exception("Report generation failed")

        raise HTTPException(
            status_code=500,
            detail="Report generation failed. Check the backend logs.",
        ) from exc
