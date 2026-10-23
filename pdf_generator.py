
import os
import re
import html
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
)


def create_pdf(markdown_text, filename="market_research_report.pdf"):
    os.makedirs("reports", exist_ok=True)
    filepath = os.path.join("reports", filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title="Market Research Report",
        author="Market Research Agent",
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="CoverTitle",
        parent=styles["Title"],
        fontSize=24,
        leading=30,
        alignment=TA_CENTER,
        spaceAfter=18,
    ))
    styles.add(ParagraphStyle(
        name="SectionHeading",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#183153"),
        spaceBefore=14,
        spaceAfter=8,
    ))

    story = [
        Spacer(1, 35 * mm),
        Paragraph("Market Research Report", styles["CoverTitle"]),
        Paragraph(
            f"Prepared on {date.today().isoformat()}",
            styles["Normal"],
        ),
        Spacer(1, 15 * mm),
        HRFlowable(width="100%", thickness=1),
        Spacer(1, 15 * mm),
    ]

    for line in markdown_text.splitlines():
        line = line.strip()

        if not line:
            story.append(Spacer(1, 5))
            continue

        if line.startswith("# "):
            story.append(Paragraph(
                html.escape(line[2:]),
                styles["Heading1"],
            ))
        elif line.startswith("## ") or line.startswith("### "):
            heading = line.lstrip("#").strip()
            story.append(Paragraph(
                html.escape(heading),
                styles["SectionHeading"],
            ))
        elif line.startswith(("- ", "* ")):
            bullet = html.escape(line[2:])
            story.append(Paragraph(
                f"&bull; {bullet}",
                styles["BodyText"],
            ))
        else:
            # Escape HTML before applying basic Markdown emphasis.
            safe = html.escape(line)
            safe = re.sub(
                r"\*\*(.+?)\*\*",
                r"<b>\1</b>",
                safe,
            )
            safe = re.sub(
                r"\*(.+?)\*",
                r"<i>\1</i>",
                safe,
            )
            story.append(Paragraph(safe, styles["BodyText"]))

    doc.build(story)
    return filepath
