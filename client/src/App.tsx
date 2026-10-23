
import { useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  FileText,
  Globe2,
  Layers3,
  LoaderCircle,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  SquarePen,
  X,
} from "lucide-react";
import "./index.css";

type Message = {
  role: "user" | "assistant";
  content: string;
  fileUrl?: string;
  filename?: string;
};

const examples = [
  {
    icon: Globe2,
    title: "Explore a market",
    prompt:
      "Research the Indian online education market, including its size, growth trends, customer segments, and opportunities for a new startup.",
  },
  {
    icon: Search,
    title: "Analyze competitors",
    prompt:
      "Compare five competitors in the Indian AI productivity software market. Analyze features, pricing, target customers, strengths, and weaknesses.",
  },
  {
    icon: Layers3,
    title: "Find opportunities",
    prompt:
      "Identify underserved customer segments and potential business opportunities in India's personal finance technology market.",
  },
];

export default function App() {
  const [requirements, setRequirements] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function sendMessage(text = requirements) {
    const query = text.trim();

    if (!query || loading) return;

    setError("");
    setRequirements("");
    setLoading(true);

    setMessages((previous) => [
      ...previous,
      { role: "user", content: query },
      {
        role: "assistant",
        content:
          "I'm preparing your research report. The research, writing, and editing stages will run on the backend.",
      },
    ]);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: query }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Request failed (${response.status})`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("The server returned an empty PDF.");
      }

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/pdf")) {
        throw new Error(
          "The backend did not return a PDF. Check the API response."
        );
      }

      const fileUrl = URL.createObjectURL(blob);
      const disposition = response.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const filename = match?.[1] || "market-research-report.pdf";

      setMessages((previous) => [
        ...previous.slice(0, -1),
        {
          role: "assistant",
          content:
            "Your market research report is ready. Download the PDF below.",
          fileUrl,
          filename,
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);

      setMessages((previous) => [
        ...previous.slice(0, -1),
        {
          role: "assistant",
          content:
            "I couldn't generate the report. Check that the Python API is running and review the error message.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    if (loading) return;

    messages.forEach((message) => {
      if (message.fileUrl) URL.revokeObjectURL(message.fileUrl);
    });

    setMessages([]);
    setRequirements("");
    setError("");
    setSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Activity size={20} />
          </div>
          <span>insight<span className="brand-light">lab</span></span>
          <button
            className="icon-button mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <button className="new-chat-button" onClick={startNewChat}>
          <Plus size={17} />
          <span>New research</span>
          <SquarePen size={16} className="new-chat-end" />
        </button>

        <div className="sidebar-label">WORKSPACE</div>

        <button className="nav-item active">
          <MessageSquare size={17} />
          <span>Research assistant</span>
        </button>

        <button className="nav-item" onClick={startNewChat}>
          <FileText size={17} />
          <span>Reports</span>
        </button>

        <div className="sidebar-bottom">
          <div className="status-indicator">
            <span className="status-dot" />
            <div>
              <div className="status-title">Research workspace</div>
              <div className="status-subtitle">Local development</div>
            </div>
          </div>
          <div className="sidebar-footer">Powered by Gemini</div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <span className="breadcrumb-muted">Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-current">Research assistant</span>
            <ChevronDown size={14} className="breadcrumb-chevron" />
          </div>
          <div className="topbar-right">
            <span className="model-pill">
              <span className="model-dot" />
              Gemini
            </span>
          </div>
        </header>

        <section className="conversation">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">
                <Sparkles size={23} />
              </div>

              <div className="eyebrow">YOUR AI RESEARCH TEAM</div>
              <h1>
                Good research.
                <br />
                <span>Better decisions.</span>
              </h1>
              <p className="welcome-description">
                Turn your business questions into evidence-backed market
                research, competitive analysis, and polished PDF reports.
              </p>

              <div className="example-grid">
                {examples.map((example) => {
                  const Icon = example.icon;

                  return (
                    <button
                      key={example.title}
                      className="example-card"
                      onClick={() => {
                        setRequirements(example.prompt);
                        inputRef.current?.focus();
                      }}
                    >
                      <div className="example-icon">
                        <Icon size={18} />
                      </div>
                      <div className="example-title">{example.title}</div>
                      <div className="example-description">
                        {example.title === "Explore a market" &&
                          "Understand trends, demand, and market potential."}
                        {example.title === "Analyze competitors" &&
                          "Compare positioning, features, and pricing."}
                        {example.title === "Find opportunities" &&
                          "Discover gaps and actionable business ideas."}
                      </div>
                      <ArrowUp
                        size={15}
                        className="example-arrow"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="workflow-note">
                <div className="workflow-icon">
                  <Search size={16} />
                </div>
                <div>
                  <strong>Research with sources</strong>
                  <span>
                    Web research → Report writing → Editorial review
                  </span>
                </div>
                <Check size={16} className="workflow-check" />
              </div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((message, index) => (
                <div
                  key={`${index}-${message.role}`}
                  className={`message-row ${message.role}`}
                >
                  {message.role === "assistant" && (
                    <div className="message-avatar">
                      <Sparkles size={16} />
                    </div>
                  )}

                  <div className="message-content">
                    <div className="message-author">
                      {message.role === "user" ? "You" : "Insightlab"}
                    </div>
                    <p>{message.content}</p>

                    {message.fileUrl && (
                      <a
                        className="download-card"
                        href={message.fileUrl}
                        download={message.filename}
                      >
                        <div className="pdf-icon">
                          <FileText size={21} />
                        </div>
                        <div className="download-info">
                          <strong>{message.filename}</strong>
                          <span>PDF document · Ready to download</span>
                        </div>
                        <ArrowDown size={18} />
                      </a>
                    )}

                    {loading &&
                      message.role === "assistant" &&
                      index === messages.length - 1 && (
                        <div className="working-indicator">
                          <LoaderCircle size={15} className="spin" />
                          <span>Working on your report…</span>
                        </div>
                      )}
                  </div>
                </div>
              ))}
              <div className="conversation-end" />
            </div>
          )}
        </section>

        <footer className="composer-area">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={15} />
              </button>
            </div>
          )}

          <div className="composer">
            <textarea
              ref={inputRef}
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Describe the market you want to research..."
              rows={2}
              disabled={loading}
            />

            <div className="composer-bottom">
              <span className="composer-hint">
                Be specific about your market, location, and competitors.
              </span>
              <button
                className="send-button"
                disabled={!requirements.trim() || loading}
                onClick={() => void sendMessage()}
                aria-label="Generate report"
              >
                {loading ? (
                  <LoaderCircle size={17} className="spin" />
                ) : (
                  <ArrowUp size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="disclaimer">
            AI-generated research can contain errors. Verify important findings
            against original sources.
          </div>
        </footer>
      </main>
    </div>
  );
}
