import { useState, useRef, useEffect, useCallback } from "react";

let _id = 0;
const nextId = () => ++_id;

const SESSION_ID = crypto.randomUUID();

const MAX_CHARS = 2000;

// ─────────────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .chat-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e8edf4;
    font-family: 'DM Mono', monospace;
    position: relative;
    overflow: hidden;
  }

  .chat-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 15% 10%, rgba(20,184,166,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 70% at 85% 85%, rgba(234,88,12,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 55% 45%, rgba(99,102,241,0.07) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .chat-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(100,116,139,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(100,116,139,0.06) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  .chat-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 680px;
    margin: 24px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 48px);
    max-height: 820px;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid rgba(148,163,184,0.35);
    background: rgba(248,250,252,0.88);
    backdrop-filter: blur(32px) saturate(140%);
    box-shadow:
      0 0 0 1px rgba(20,184,166,0.1),
      0 24px 64px rgba(30,41,59,0.18),
      0 4px 16px rgba(30,41,59,0.08);
  }

  /* ─── HEADER ─── */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 22px;
    border-bottom: 1px solid rgba(148,163,184,0.2);
    background: rgba(255,255,255,0.7);
    flex-shrink: 0;
    gap: 10px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, #0d9488, #ea580c);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: 0 4px 14px rgba(13,148,136,0.3);
    flex-shrink: 0;
  }

  .header-info h2 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 17px;
    color: #0f172a;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }

  .header-info p {
    font-size: 11px;
    color: #64748b;
    font-weight: 400;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 2px;
    white-space: nowrap;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .header-badge {
    padding: 5px 12px;
    border-radius: 20px;
    background: rgba(13,148,136,0.1);
    border: 1px solid rgba(13,148,136,0.25);
    font-size: 10px;
    color: #0d9488;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 600;
  }

  /* ─── CLEAR BUTTON ─── */
  .clear-btn {
    height: 32px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid rgba(148,163,184,0.3);
    background: rgba(248,250,252,0.8);
    color: #94a3b8;
    cursor: pointer;
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }

  .clear-btn:hover:not(:disabled) {
    background: rgba(254,226,226,0.8);
    border-color: rgba(239,68,68,0.3);
    color: #ef4444;
  }

  .clear-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* ─── CHAT BOX ─── */
  .chat-box {
    flex: 1;
    overflow-y: auto;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    scroll-behavior: smooth;
    background: rgba(241,245,249,0.5);
  }

  .chat-box::-webkit-scrollbar { width: 4px; }
  .chat-box::-webkit-scrollbar-track { background: transparent; }
  .chat-box::-webkit-scrollbar-thumb {
    background: rgba(148,163,184,0.4);
    border-radius: 4px;
  }

  /* ─── EMPTY STATE ─── */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    opacity: 0.35;
    padding: 40px;
    text-align: center;
  }

  .empty-state .big-icon { font-size: 48px; filter: grayscale(0.3); }

  .empty-state p {
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
    max-width: 260px;
  }

  /* ─── MESSAGES ─── */
  .message-row {
    display: flex;
    margin-bottom: 6px;
    animation: msg-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @keyframes msg-in {
    from { opacity: 0; transform: translateY(12px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .message-row.user { justify-content: flex-end; }
  .message-row.bot  { justify-content: flex-start; }

  .bubble-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 78%;
  }

  .message-row.user .bubble-wrap { align-items: flex-end; }
  .message-row.bot  .bubble-wrap { align-items: flex-start; }

  .sender-label {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #94a3b8;
    padding: 0 4px;
    font-weight: 500;
  }

  .bubble {
    padding: 12px 18px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.65;
    position: relative;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .message-row.user .bubble {
    background: linear-gradient(135deg, #0d9488, #0891b2);
    color: #fff;
    border-bottom-right-radius: 5px;
    box-shadow: 0 4px 20px rgba(13,148,136,0.25);
  }

  .message-row.bot .bubble {
    background: #ffffff;
    color: #1e293b;
    border: 1px solid rgba(148,163,184,0.25);
    border-bottom-left-radius: 5px;
    box-shadow: 0 2px 8px rgba(30,41,59,0.07);
  }

  .message-row.bot .bubble.error-bubble {
    background: #fff5f5;
    border-color: rgba(239,68,68,0.2);
    color: #dc2626;
  }

  /* ─── COPY BUTTON (New Feature) ─── */
  .bubble-actions {
    display: flex;
    gap: 6px;
    padding: 0 2px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .bubble-wrap:hover .bubble-actions { opacity: 1; }

  .copy-btn {
    padding: 3px 9px;
    border-radius: 6px;
    border: 1px solid rgba(148,163,184,0.3);
    background: rgba(248,250,252,0.9);
    color: #64748b;
    cursor: pointer;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.06em;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .copy-btn:hover {
    background: rgba(13,148,136,0.08);
    border-color: rgba(13,148,136,0.3);
    color: #0d9488;
  }

  .copy-btn.copied {
    background: rgba(22,163,74,0.08);
    border-color: rgba(22,163,74,0.3);
    color: #16a34a;
  }

  /* ─── TYPING INDICATOR ─── */
  .typing-bubble {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 14px 18px;
  }

  .typing-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(13,148,136,0.6);
    animation: typing 1.2s ease infinite;
  }

  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes typing {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    40%       { transform: translateY(-6px); opacity: 1; }
  }

  /* ─── INPUT AREA ─── */
  .input-area {
    padding: 14px 20px 18px;
    border-top: 1px solid rgba(148,163,184,0.2);
    background: rgba(255,255,255,0.7);
    flex-shrink: 0;
  }

  .input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f1f5f9;
    border: 1px solid rgba(148,163,184,0.3);
    border-radius: 16px;
    padding: 8px 8px 8px 18px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .input-wrap:focus-within {
    border-color: rgba(13,148,136,0.5);
    box-shadow: 0 0 0 3px rgba(13,148,136,0.1);
    background: #fff;
  }

  .chat-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #1e293b;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    padding: 6px 0;
    caret-color: #0d9488;
    resize: none;
    min-height: 28px;
    max-height: 120px;
    line-height: 1.5;
    overflow-y: auto;
  }

  .chat-input::placeholder { color: #94a3b8; }

  .send-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #0d9488, #0891b2);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    box-shadow: 0 4px 14px rgba(13,148,136,0.35);
  }

  .send-btn:hover:not(:disabled) {
    transform: scale(1.07);
    box-shadow: 0 6px 20px rgba(13,148,136,0.5);
  }

  .send-btn:active:not(:disabled) { transform: scale(0.96); }

  .send-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
  }

  .send-btn svg { width: 18px; height: 18px; }

  /* ─── FOOTER ROW ─── */
  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    padding: 0 2px;
  }

  .footer-hint {
    font-size: 11px;
    color: #94a3b8;
    letter-spacing: 0.04em;
  }

  /* ─── CHAR COUNTER ─── */
  .char-counter {
    font-size: 11px;
    color: #cbd5e1;
    letter-spacing: 0.04em;
    transition: color 0.2s;
  }

  .char-counter.warn  { color: rgba(234,88,12,0.7); }
  .char-counter.limit { color: rgba(239,68,68,0.8); }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────
function TypingBubble() {
  return (
    <div className="message-row bot">
      <div className="bubble-wrap">
        <span className="sender-label">Bruno</span>
        <div className="bubble typing-bubble">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <button
      className={`copy-btn ${copied ? "copied" : ""}`}
      onClick={handleCopy}
      aria-label="Copy message"
      title="Copy to clipboard"
    >
      {copied ? "✓ Copied" : "⎘ Copy"}
    </button>
  );
}

// ─── Main Chat Component ──────────────────────────────────────────────────────
function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat]       = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isLoading]);

  const sendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    const text = message.trim();
    const userMsgId = nextId();
    setChat((prev) => [...prev, { id: userMsgId, sender: "user", text }]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, session_id: SESSION_ID }),
      });

      if (!res.ok) {
        let detail = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          detail = errData.detail || detail;
        } catch { /* non-JSON error body */ }
        setChat((prev) => [
          ...prev,
          { id: nextId(), sender: "bot", text: `⚠️ ${detail}`, isError: true },
        ]);
        return;
      }

      const data = await res.json();
      setChat((prev) => [...prev, { id: nextId(), sender: "bot", text: data.answer }]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          id: nextId(),
          sender: "bot",
          text: "⚠️ Cannot reach Bruno's server. Make sure the FastAPI backend is running on port 8000.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [message, isLoading]);

  const clearChat = async () => {
    try {
      await fetch("http://127.0.0.1:8000/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID }),
      });
    } catch { /* ignore — we still clear the UI */ }
    setChat([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const charCount  = message.length;
  const counterCls = charCount > MAX_CHARS
    ? "char-counter limit"
    : charCount > MAX_CHARS * 0.85
    ? "char-counter warn"
    : "char-counter";

  return (
    <>
      <style>{styles}</style>
      <div className="chat-root">
        <div className="chat-container">

          {/* ─── Header ─── */}
          <div className="chat-header">
            <div className="header-left">
              <div className="avatar">🤖</div>
              <div className="header-info">
                <h2>Bruno</h2>
                <p>AI Assistant · Always online</p>
              </div>
            </div>
            <div className="header-right">
              <div className="header-badge">v2.0</div>
              <button
                className="clear-btn"
                onClick={clearChat}
                disabled={chat.length === 0 || isLoading}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                🗑 Clear
              </button>
            </div>
          </div>

          {/* ─── Messages ─── */}
          <div className="chat-box">
            {chat.length === 0 && !isLoading && (
              <div className="empty-state">
                <div className="big-icon">💬</div>
                <p>Start a conversation with Bruno.<br />Ask me anything.</p>
              </div>
            )}

            {chat.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                <div className="bubble-wrap">
                  <span className="sender-label">
                    {msg.sender === "user" ? "You" : "Bruno"}
                  </span>
                  <div className={`bubble${msg.isError ? " error-bubble" : ""}`}>
                    {msg.text}
                  </div>
                  {msg.sender === "bot" && !msg.isError && (
                    <div className="bubble-actions">
                      <CopyButton text={msg.text} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && <TypingBubble />}
            <div ref={bottomRef} />
          </div>

          {/* ─── Input ─── */}
          <div className="input-area">
            <div className="input-wrap">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setMessage(e.target.value);
                  }
                }}
                placeholder="Ask Bruno something... (Shift+Enter for new line)"
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
                aria-label="Message input"
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                aria-label="Send message"
                title="Send (Enter)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            {/* New Feature: Footer with char counter + hint */}
            <div className="footer-row">
              <p className="footer-hint">Enter to send · Shift+Enter for new line</p>
              <span className={counterCls}>{charCount}/{MAX_CHARS}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Chat;