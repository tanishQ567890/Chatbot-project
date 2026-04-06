import { useState, useRef, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .chat-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    font-family: 'DM Mono', monospace;
    position: relative;
    overflow: hidden;
  }

  .chat-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99, 50, 255, 0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 80% 90%, rgba(0, 210, 200, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 60% 40%, rgba(255, 80, 180, 0.07) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  /* Floating grid lines */
  .chat-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
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
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(14, 14, 22, 0.75);
    backdrop-filter: blur(32px) saturate(180%);
    box-shadow:
      0 0 0 1px rgba(99,50,255,0.15),
      0 32px 80px rgba(0,0,0,0.6),
      0 0 120px rgba(99,50,255,0.08) inset;
  }

  /* ─── HEADER ─── */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(99,50,255,0.06);
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, #6332ff, #00d2c8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    position: relative;
    box-shadow: 0 0 20px rgba(99,50,255,0.4);
    flex-shrink: 0;
  }

  .avatar::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    background: #00e676;
    border-radius: 50%;
    border: 2px solid #0e0e16;
    animation: pulse-dot 2s ease infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,230,118,0.5); }
    50% { box-shadow: 0 0 0 5px rgba(0,230,118,0); }
  }

  .header-info h2 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 18px;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .header-info p {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    font-weight: 300;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .header-badge {
    padding: 5px 12px;
    border-radius: 20px;
    background: rgba(0,210,200,0.1);
    border: 1px solid rgba(0,210,200,0.25);
    font-size: 10px;
    color: #00d2c8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 500;
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
  }

  .chat-box::-webkit-scrollbar { width: 4px; }
  .chat-box::-webkit-scrollbar-track { background: transparent; }
  .chat-box::-webkit-scrollbar-thumb {
    background: rgba(99,50,255,0.4);
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

  .empty-state .big-icon {
    font-size: 48px;
    filter: grayscale(0.3);
  }

  .empty-state p {
    font-size: 13px;
    color: rgba(255,255,255,0.6);
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
    max-width: 75%;
  }

  .message-row.user .bubble-wrap { align-items: flex-end; }
  .message-row.bot  .bubble-wrap { align-items: flex-start; }

  .sender-label {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    padding: 0 4px;
    font-weight: 500;
  }

  .bubble {
    padding: 12px 18px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.6;
    position: relative;
    word-break: break-word;
  }

  .message-row.user .bubble {
    background: linear-gradient(135deg, #6332ff, #8b5cf6);
    color: #fff;
    border-bottom-right-radius: 5px;
    box-shadow: 0 4px 24px rgba(99,50,255,0.35);
  }

  .message-row.bot .bubble {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.9);
    border: 1px solid rgba(255,255,255,0.09);
    border-bottom-left-radius: 5px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
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
    background: rgba(0,210,200,0.7);
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
    padding: 16px 20px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(10,10,15,0.5);
    flex-shrink: 0;
  }

  .input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 16px;
    padding: 8px 8px 8px 18px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .input-wrap:focus-within {
    border-color: rgba(99,50,255,0.5);
    box-shadow: 0 0 0 3px rgba(99,50,255,0.1), 0 0 30px rgba(99,50,255,0.08) inset;
  }

  .chat-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: rgba(255,255,255,0.9);
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    padding: 6px 0;
    caret-color: #6332ff;
  }

  .chat-input::placeholder { color: rgba(255,255,255,0.25); }

  .send-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #6332ff, #00d2c8);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    box-shadow: 0 4px 16px rgba(99,50,255,0.4);
  }

  .send-btn:hover:not(:disabled) {
    transform: scale(1.07);
    box-shadow: 0 6px 24px rgba(99,50,255,0.55);
  }

  .send-btn:active:not(:disabled) { transform: scale(0.96); }

  .send-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
  }

  .send-btn svg {
    width: 18px;
    height: 18px;
  }

  .footer-hint {
    text-align: center;
    font-size: 11px;
    color: rgba(255,255,255,0.18);
    margin-top: 10px;
    letter-spacing: 0.04em;
  }
`;

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

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isLoading]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const text = message.trim();
    setChat((prev) => [...prev, { sender: "user", text }]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      setChat((prev) => [...prev, { sender: "bot", text: data.answer }]);
    } catch {
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Connection error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="chat-root">
        <div className="chat-container">

          {/* Header */}
          <div className="chat-header">
            <div className="header-left">
              <div className="avatar">🤖</div>
              <div className="header-info">
                <h2>Bruno</h2>
                <p>AI Assistant · Always online</p>
              </div>
            </div>
            <div className="header-badge">v2.0</div>
          </div>

          {/* Chat messages */}
          <div className="chat-box">
            {chat.length === 0 && !isLoading && (
              <div className="empty-state">
                <div className="big-icon">💬</div>
                <p>Start a conversation with Bruno. Ask me anything.</p>
              </div>
            )}

            {chat.map((msg, i) => (
              <div key={i} className={`message-row ${msg.sender}`}>
                <div className="bubble-wrap">
                  <span className="sender-label">
                    {msg.sender === "user" ? "You" : "Bruno"}
                  </span>
                  <div className="bubble">{msg.text}</div>
                </div>
              </div>
            ))}

            {isLoading && <TypingBubble />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-wrap">
              <input
                ref={inputRef}
                className="chat-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask Bruno something..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isLoading}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="footer-hint">Enter to send · Powered by Bruno AI</p>
          </div>

        </div>
      </div>
    </>
  );
}

export default Chat;