import { useState } from "react"
import axios from "axios"

export default function OutputPanel({ generatedContent, isLoading, onRegenerate, factSheet, theme: T }) {
  const [activeTab, setActiveTab] = useState("blog")
  const [copied, setCopied] = useState(null)
  const [regenLoading, setRegenLoading] = useState(null)

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRegenerate = async (type) => {
    setRegenLoading(type)
    await onRegenerate(type)
    setRegenLoading(null)
  }

  const handleDownload = async (content, format, filename) => {
    try {
      const res = await axios.post("/api/download", {
        content, format, filename: "wordloom-content"
      }, { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Download failed", e)
    }
  }

  if (isLoading) return (
    <Panel T={T}>
      <Loader label="Agent 2 writing..." color="#f472b6" />
    </Panel>
  )

  if (!generatedContent) return (
    <Panel T={T}>
      <Empty />
    </Panel>
  )

  const tabs = [
    { id: "blog", label: "Blog Post", icon: "◆" },
    { id: "social", label: "Social", icon: "◇" },
    { id: "email", label: "Email", icon: "○" }
  ]

  return (
    <Panel T={T} scroll>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "30px", height: "30px", borderRadius: "8px",
          background: "rgba(244,114,182,0.12)",
          border: "1px solid rgba(244,114,182,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>◉</div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: T.text }}>
            Generated Content
          </div>
          <div style={{ fontSize: "11px", color: "#4ade80" }}>✓ Agent 2 complete</div>
        </div>
      </div>

      <div style={{ height: "1px", background: T.border }}/>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "4px",
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${T.border}`,
        borderRadius: "10px", padding: "4px"
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              background: activeTab === tab.id
                ? "rgba(155,77,255,0.2)"
                : "transparent",
              border: `1px solid ${activeTab === tab.id
                ? "rgba(155,77,255,0.4)"
                : "transparent"}`,
              borderRadius: "7px", padding: "8px 4px",
              color: activeTab === tab.id ? "#c084fc" : T.textDim,
              fontSize: "12px", fontWeight: "600",
              cursor: "pointer", transition: "all 0.2s"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Blog */}
      {activeTab === "blog" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <ActionBar
            onCopy={() => copy(generatedContent.blog_post, "blog")}
            onRegen={() => handleRegenerate("blog")}
            onDownload={() => handleDownload(generatedContent.blog_post, "blog_docx", "wordloom-blog.txt")}
            copied={copied === "blog"}
            regenLoading={regenLoading === "blog"}
            T={T}
          />
          <div style={contentBox(T)}>
            {generatedContent.blog_post}
          </div>
        </div>
      )}

      {/* Social */}
      {activeTab === "social" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <ActionBar
            onCopy={() => copy(generatedContent.social_media_thread.join("\n\n"), "social-all")}
            onRegen={() => handleRegenerate("social")}
            onDownload={() => handleDownload(
              generatedContent.social_media_thread.join("\n\n---\n\n"),
              "social_txt", "wordloom-social.txt"
            )}
            copied={copied === "social-all"}
            regenLoading={regenLoading === "social"}
            T={T}
          />
          {generatedContent.social_media_thread.map((post, i) => (
            <div key={i} style={{
              background: "rgba(0,0,0,0.3)",
              border: `1px solid ${T.border}`,
              borderRadius: "10px", padding: "14px"
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "8px"
              }}>
                <span style={{
                  fontSize: "10px", fontWeight: "700",
                  color: "#c084fc", letterSpacing: "0.12em"
                }}>POST {i + 1} / 5</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontSize: "10px",
                    color: post.length > 260 ? T.red : T.textDim
                  }}>{post.length}/280</span>
                  <SmallCopyBtn
                    onClick={() => copy(post, `p${i}`)}
                    copied={copied === `p${i}`}
                    T={T}
                  />
                </div>
              </div>
              <p style={{
                color: T.textMuted, fontSize: "13px",
                lineHeight: "1.6", margin: 0
              }}>{post}</p>
            </div>
          ))}
        </div>
      )}

      {/* Email */}
      {activeTab === "email" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <ActionBar
            onCopy={() => copy(generatedContent.email_teaser, "email")}
            onRegen={() => handleRegenerate("email")}
            onDownload={() => handleDownload(generatedContent.email_teaser, "email_txt", "wordloom-email.txt")}
            copied={copied === "email"}
            regenLoading={regenLoading === "email"}
            T={T}
          />
          <div style={{
            ...contentBox(T),
            borderTop: `2px solid rgba(155,77,255,0.2)`
          }}>
            <div style={{
              paddingBottom: "10px", marginBottom: "12px",
              borderBottom: `1px solid ${T.border}`
            }}>
              <div style={{ fontSize: "11px", color: T.textDim, marginBottom: "3px" }}>
                Subject: Introducing something new...
              </div>
              <div style={{ fontSize: "11px", color: T.textDim }}>
                To: your-subscribers@list.com
              </div>
            </div>
            <p style={{
              color: T.textMuted, fontSize: "13px",
              lineHeight: "1.8", margin: 0
            }}>{generatedContent.email_teaser}</p>
          </div>
        </div>
      )}

    </Panel>
  )
}

// ── Action bar (copy + regen + download) ──
function ActionBar({ onCopy, onRegen, onDownload, copied, regenLoading, T }) {
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
      <SmallBtn onClick={onCopy} T={T}>
        {copied ? "✓ Copied" : "Copy"}
      </SmallBtn>
      <SmallBtn onClick={onRegen} T={T} disabled={regenLoading}>
        {regenLoading ? "..." : "↻ Redo"}
      </SmallBtn>
      <SmallBtn onClick={onDownload} T={T}>⬇ Save</SmallBtn>
    </div>
  )
}

function SmallBtn({ children, onClick, T, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: "rgba(150,80,255,0.08)",
      border: "1px solid rgba(150,80,255,0.2)",
      borderRadius: "6px", padding: "5px 10px",
      color: "#c084fc", fontSize: "11px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1
    }}>{children}</button>
  )
}

function SmallCopyBtn({ onClick, copied, T }) {
  return (
    <button onClick={onClick} style={{
      background: copied ? "rgba(74,222,128,0.1)" : "rgba(150,80,255,0.08)",
      border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(150,80,255,0.2)"}`,
      borderRadius: "6px", padding: "3px 8px",
      color: copied ? "#4ade80" : "#c084fc",
      fontSize: "10px", cursor: "pointer"
    }}>{copied ? "✓" : "Copy"}</button>
  )
}

function Panel({ children, T, scroll }) {
  return (
    <div style={{
      background: "rgba(150,80,255,0.05)",
      border: "1px solid rgba(150,80,255,0.15)",
      borderRadius: "16px", padding: "20px",
      display: "flex", flexDirection: "column", gap: "12px",
      minHeight: "calc(100vh - 100px)",
      overflowY: scroll ? "auto" : "hidden",
      alignItems: scroll ? undefined : "center",
      justifyContent: scroll ? undefined : "center"
    }}>
      {children}
    </div>
  )
}

function Empty() {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: "32px", color: "rgba(150,80,255,0.2)", marginBottom: "12px" }}>◉</div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: "rgba(255,255,255,0.15)", marginBottom: "6px" }}>
        Generated Content
      </div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.08)" }}>
        Appears after you confirm the fact sheet
      </div>
    </div>
  )
}

function Loader({ label, color }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        border: `2px solid ${color}20`, borderTop: `2px solid ${color}`,
        margin: "0 auto 14px", animation: "spin 1s linear infinite"
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontSize: "13px", color }}>{label}</div>
    </div>
  )
}

const contentBox = (T) => ({
  background: "rgba(0,0,0,0.3)",
  border: `1px solid ${T.border}`,
  borderRadius: "10px", padding: "16px",
  color: T.textMuted, fontSize: "13px",
  lineHeight: "1.8", whiteSpace: "pre-wrap", flex: 1
})