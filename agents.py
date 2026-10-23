from smolagents import ToolCallingAgent, LiteLLMModel
import os

def create_agents(search_tools):
    # Use your locally running Ollama model.
    model = LiteLLMModel(
        model_id="gemini/gemini-3.5-flash-lite",
        api_key=os.environ["GEMINI_API_KEY"],
        # temperature=0.2,
    )

    research_agent = ToolCallingAgent(
        name="research_agent",
        description="Researches markets, industries, and competitors using web search.",
        model=model,
        tools=search_tools,
        max_steps=8,
        instructions="""
        You are a market research analyst.

        Research the user's requested industry and target market.
        Investigate market trends, competitors, their products,
        target customers, pricing when publicly available, strengths,
        weaknesses, and potential opportunities.

        Use web search to collect evidence. Prefer recent and
        credible sources, including company websites and reports.
        Include source URLs and publication dates when available.

        Clearly distinguish verified facts from estimates.
        Never invent statistics, prices, citations, or sources.

        Return structured research notes with source URLs.
        """,
    )

    writer_agent = ToolCallingAgent(
        name="report_writer",
        description="Turns research notes into a complete market research report.",
        model=model,
        tools=[],
        max_steps=4,
        instructions="""
        You are a business research report writer.

        Use only the supplied research notes and user requirements.
        Produce a detailed report with these sections:

        1. Executive summary
        2. Research scope and methodology
        3. Market overview and trends
        4. Target customers
        5. Competitor analysis
        6. Competitive comparison
        7. Market opportunities and risks
        8. Strategic recommendations
        9. Sources and references

        Preserve source URLs beside relevant claims.
        Do not invent missing market sizes, statistics, or facts.
        Explicitly identify information that could not be verified.
        Write in Markdown.
        """,
    )

    editor_agent = ToolCallingAgent(
        name="report_editor",
        description="Reviews and polishes reports for client delivery.",
        model=model,
        tools=[],
        max_steps=4,
        instructions="""
        You are a senior business editor reviewing a client-facing report.

        Improve clarity, structure, grammar, consistency, and professional
        tone. Remove repetition and unsupported claims. Preserve important
        findings, caveats, and source URLs.

        Check that recommendations follow from the research.
        Do not create new facts or pretend to have independently verified
        claims that you have not checked.

        Return only the final polished report in Markdown.
        """,
    )

    return research_agent, writer_agent, editor_agent


def generate_report(user_requirements, agents):
    research_agent, writer_agent, editor_agent = agents

    research = research_agent.run(
        f"Conduct market and competitor research for:\n{user_requirements}"
    )

    draft = writer_agent.run(
        f"""
        User requirements:
        {user_requirements}

        Research notes from Agent 1:
        {research}

        Write the complete report.
        """
    )

    final_report = editor_agent.run(
        f"""
        User requirements:
        {user_requirements}

        Draft from Agent 2:
        {draft}

        Edit this into the final client-facing report.
        """
    )

    return str(final_report)
