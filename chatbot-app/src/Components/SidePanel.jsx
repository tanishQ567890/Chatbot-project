import { useState } from "react";

const panelStyles = `
  /* ─── Side Panel Toggle Button ─── */
  .panel-toggle-btn {
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    z-index: 100;
    background: linear-gradient(135deg, #6332ff, #00d2c8);
    border: none;
    border-radius: 12px 0 0 12px;
    color: #fff;
    cursor: pointer;
    padding: 14px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    box-shadow: -4px 0 20px rgba(99,50,255,0.35);
    transition: padding 0.2s, box-shadow 0.2s;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  .panel-toggle-btn:hover {
    padding: 14px 13px;
    box-shadow: -6px 0 28px rgba(99,50,255,0.5);
  }

  /* ─── Overlay ─── */
  .panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 110;
    backdrop-filter: blur(4px);
    animation: fade-in 0.2s ease both;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ─── Side Panel ─── */
  .side-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(420px, 92vw);
    z-index: 120;
    background: rgba(12, 12, 20, 0.97);
    backdrop-filter: blur(40px) saturate(160%);
    border-left: 1px solid rgba(99,50,255,0.2);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    animation: slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    box-shadow: -20px 0 60px rgba(0,0,0,0.6);
  }

  @keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }

  .side-panel::-webkit-scrollbar { width: 3px; }
  .side-panel::-webkit-scrollbar-thumb {
    background: rgba(99,50,255,0.4);
    border-radius: 3px;
  }

  /* ─── Panel Header ─── */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 28px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    position: sticky;
    top: 0;
    background: rgba(12,12,20,0.95);
    backdrop-filter: blur(20px);
    z-index: 1;
  }

  .panel-header h3 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: #fff;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .panel-close-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: background 0.15s, color 0.15s;
  }

  .panel-close-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }

  /* ─── Panel Body ─── */
  .panel-body {
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* ─── Profile Card ─── */
  .profile-card {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .profile-avatar {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: linear-gradient(135deg, #6332ff 0%, #00d2c8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    flex-shrink: 0;
    box-shadow: 0 0 30px rgba(99,50,255,0.4);
  }

  .profile-info h4 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 22px;
    color: #fff;
    margin: 0 0 4px;
    letter-spacing: -0.02em;
  }

  .profile-info .role {
    font-size: 13px;
    color: #00d2c8;
    font-weight: 500;
    margin: 0 0 6px;
  }

  .profile-info .location {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    margin: 0;
  }

  /* ─── Section Titles ─── */
  .section-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.07);
  }

  /* ─── About ─── */
  .about-text {
    font-size: 13.5px;
    line-height: 1.7;
    color: rgba(255,255,255,0.65);
  }

  /* ─── Skills ─── */
  .skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .skill-chip {
    padding: 5px 13px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    transition: transform 0.15s;
    cursor: default;
  }

  .skill-chip:hover { transform: translateY(-2px); }

  .chip-ai    { background: rgba(99,50,255,0.18);  border: 1px solid rgba(99,50,255,0.4);  color: #a78bfa; }
  .chip-web   { background: rgba(0,210,200,0.12);  border: 1px solid rgba(0,210,200,0.3);  color: #5eead4; }
  .chip-tools { background: rgba(255,80,180,0.1);  border: 1px solid rgba(255,80,180,0.25); color: #f0abfc; }

  /* ─── Project Card ─── */
  .project-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 18px;
    transition: border-color 0.2s, background 0.2s;
  }

  .project-card:hover {
    border-color: rgba(99,50,255,0.3);
    background: rgba(99,50,255,0.06);
  }

  .project-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .project-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: #fff;
  }

  .project-badge {
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .badge-live { background: rgba(0,230,118,0.15); color: #4ade80; border: 1px solid rgba(0,230,118,0.3); }
  .badge-wip  { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }

  .project-desc {
    font-size: 12.5px;
    color: rgba(255,255,255,0.5);
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .project-tag {
    font-size: 11px;
    padding: 3px 9px;
    border-radius: 6px;
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.45);
    font-weight: 500;
  }

  /* ─── Social Links ─── */
  .social-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .social-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s;
  }

  .social-link:hover {
    background: rgba(99,50,255,0.1);
    border-color: rgba(99,50,255,0.3);
    color: #fff;
    transform: translateX(4px);
  }

  .social-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .social-label {
    flex: 1;
  }

  .social-arrow {
    font-size: 14px;
    opacity: 0.4;
  }

  /* ─── Availability Badge ─── */
  .availability {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-radius: 14px;
    background: rgba(0,230,118,0.08);
    border: 1px solid rgba(0,230,118,0.2);
  }

  .avail-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #22c55e;
    flex-shrink: 0;
    animation: pulse-dot 2s ease infinite;
  }

  .availability p {
    font-size: 13px;
    color: rgba(255,255,255,0.7);
    margin: 0;
  }

  .availability strong {
    color: #4ade80;
  }
`;

const SKILLS = {
  ai:    ["Python", "LangChain", "Ollama", "LLaMA 3", "FastAPI", "Pydantic"],
  web:   ["React", "Vite", "JavaScript", "HTML/CSS", "REST APIs"],
  tools: ["Git", "VS Code", "Docker", "Uvicorn"],
};

const PROJECTS = [
  {
    name: "Bruno AI Chatbot",
    badge: "live",
    desc: "A full-stack AI assistant powered by LLaMA 3 running locally via Ollama. FastAPI backend with session management and a sleek React frontend.",
    tags: ["FastAPI", "LangChain", "React", "Ollama", "LLaMA 3"],
  },
  {
    name: "Next Project",
    badge: "wip",
    desc: "Coming soon — stay tuned for more AI-powered projects.",
    tags: ["Python", "AI/ML"],
  },
];

const SOCIALS = [
  { icon: "🐙", label: "GitHub",   href: "https://github.com/tanishQ567890",   handle: "github.com/tanishQ567890" },
  { icon: "💼", label: "LinkedIn", href: "#",                                   handle: "Add your LinkedIn" },
  { icon: "📧", label: "Email",    href: "mailto:you@example.com",              handle: "you@example.com" },
];

export default function SidePanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{panelStyles}</style>

      {/* Toggle button — visible on the right edge */}
      <button
        className="panel-toggle-btn"
        onClick={() => setOpen(true)}
        aria-label="Open developer portfolio"
        title="About the Developer"
      >
        Portfolio
      </button>

      {/* Overlay + Panel */}
      {open && (
        <>
          <div className="panel-overlay" onClick={() => setOpen(false)} />
          <aside className="side-panel" role="complementary" aria-label="Developer Portfolio">

            {/* Header */}
            <div className="panel-header">
              <h3>👨‍💻 About the Dev</h3>
              <button
                className="panel-close-btn"
                onClick={() => setOpen(false)}
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            <div className="panel-body">

              {/* Profile */}
              <div className="profile-card">
                <div className="profile-avatar">🚀</div>
                <div className="profile-info">
                  <h4>TanishQ</h4>
                  <p className="role">AI &amp; Full-Stack Developer</p>
                  <p className="location">📍 India · Open to opportunities</p>
                </div>
              </div>

              {/* Availability */}
              <div className="availability">
                <div className="avail-dot" />
                <p><strong>Available for work</strong> — Open to freelance &amp; full-time roles</p>
              </div>

              {/* About */}
              <div>
                <p className="section-title">About</p>
                <p className="about-text">
                  I build intelligent systems at the intersection of AI and modern web.
                  Passionate about local-first AI, privacy-respecting tools, and creating
                  experiences that feel fast and alive. Bruno AI is one of my projects
                  showcasing end-to-end AI integration without cloud dependency.
                </p>
              </div>

              {/* Skills */}
              <div>
                <p className="section-title">Skills</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="skills-grid">
                    {SKILLS.ai.map((s) => <span key={s} className="skill-chip chip-ai">{s}</span>)}
                  </div>
                  <div className="skills-grid">
                    {SKILLS.web.map((s) => <span key={s} className="skill-chip chip-web">{s}</span>)}
                  </div>
                  <div className="skills-grid">
                    {SKILLS.tools.map((s) => <span key={s} className="skill-chip chip-tools">{s}</span>)}
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div>
                <p className="section-title">Projects</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {PROJECTS.map((p) => (
                    <div key={p.name} className="project-card">
                      <div className="project-card-header">
                        <span className="project-name">{p.name}</span>
                        <span className={`project-badge badge-${p.badge}`}>
                          {p.badge === "live" ? "● Live" : "⟳ WIP"}
                        </span>
                      </div>
                      <p className="project-desc">{p.desc}</p>
                      <div className="project-tags">
                        {p.tags.map((t) => <span key={t} className="project-tag">{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <p className="section-title">Connect</p>
                <div className="social-links">
                  {SOCIALS.map(({ icon, label, href, handle }) => (
                    <a
                      key={label}
                      href={href}
                      className="social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="social-icon">{icon}</span>
                      <span className="social-label">
                        <strong style={{ display: "block", fontSize: 13, color: "#fff" }}>{label}</strong>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{handle}</span>
                      </span>
                      <span className="social-arrow">→</span>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </aside>
        </>
      )}
    </>
  );
}
