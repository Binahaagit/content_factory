import { useState, useRef } from "react"

const TONES = [
  { id:"professional", label:"Professional", desc:"Formal & authoritative" },
  { id:"casual",       label:"Casual",       desc:"Friendly & conversational" },
  { id:"witty",        label:"Witty",        desc:"Clever & playful" }
]

const INPUT_TYPES = [
  { id:"text", label:"✦ Text",     desc:"Paste content" },
  { id:"url",  label:"⬡ URL",      desc:"Scrape a page" },
  { id:"doc",  label:"◈ Document", desc:"Upload PDF/TXT" }
]

export default function InputPanel({ onGenerate, isLoading, tone, onToneChange, theme: T }) {
  const [inputType, setInputType]   = useState("text")
  const [rawContent, setRawContent] = useState("")
  const [url, setUrl]               = useState("")
  const [file, setFile]             = useState(null)
  const [dragOver, setDragOver]     = useState(false)
  const fileRef                     = useRef(null)

  const isReady = !isLoading && (
    (inputType === "text" && rawContent.trim().length >= 50) ||
    (inputType === "url"  && url.trim().startsWith("http")) ||
    (inputType === "doc"  && file !== null)
  )

  const handleSubmit = () => {
    if (!isReady) return
    if (inputType === "text") onGenerate(rawContent)
    else if (inputType === "url")  onGenerate(`__URL__::${url}`)
    else if (inputType === "doc")  onGenerate(`__DOC__::${file.name}`, file)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const charCount = rawContent.length

  // ── Shared button style ──
  const selBtn = (active) => ({
    background: active ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? "rgba(196,181,253,0.55)" : "rgba(167,139,250,0.18)"}`,
    borderRadius:"10px", padding:"10px 4px",
    cursor:"pointer", transition:"all 0.2s", textAlign:"center"
  })

  return (
    <div style={{
      background:"rgba(80,20,140,0.18)",
      border:"1px solid rgba(167,139,250,0.22)",
      borderRadius:"16px", padding:"20px",
      display:"flex", flexDirection:"column", gap:"14px",
      minHeight:"calc(100vh - 100px)",
      position:"relative", overflow:"hidden"
    }}>

      {/* Top shimmer */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"1px",
        background:"linear-gradient(90deg,transparent,rgba(196,181,253,0.4),transparent)"
      }}/>

      {/* ── HEADER ── */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <div style={{
          width:"30px", height:"30px", borderRadius:"8px",
          background:"rgba(124,58,237,0.3)",
          border:"1px solid rgba(167,139,250,0.35)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px"
        }}>📄</div>
        <div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#ede9fe" }}>
            Raw Content
          </div>
          <div style={{ fontSize:"11px", color:"#a78bfa" }}>
            Choose your input method below
          </div>
        </div>
      </div>

      <div style={{ height:"1px", background:"rgba(167,139,250,0.18)" }}/>

      {/* ── INPUT METHOD ── */}
      <div>
        <div style={{
          fontSize:"9.5px", fontWeight:"600",
          letterSpacing:"0.18em", textTransform:"uppercase",
          color:"#a78bfa", marginBottom:"8px"
        }}>Input Method</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"6px" }}>
          {INPUT_TYPES.map(t => (
            <button key={t.id} onClick={() => setInputType(t.id)} style={selBtn(inputType === t.id)}>
              <div style={{
                fontSize:"12px", fontWeight:"600", marginBottom:"3px",
                color: inputType === t.id ? "#ede9fe" : "#a78bfa"
              }}>{t.label}</div>
              <div style={{
                fontSize:"10px",
                color: inputType === t.id ? "#c4b5fd" : "rgba(167,139,250,0.5)"
              }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── TONE ── */}
      <div>
        <div style={{
          fontSize:"9.5px", fontWeight:"600",
          letterSpacing:"0.18em", textTransform:"uppercase",
          color:"#a78bfa", marginBottom:"8px"
        }}>Tone</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"6px" }}>
          {TONES.map(t => (
            <button key={t.id} onClick={() => onToneChange(t.id)} style={selBtn(tone === t.id)}>
              <div style={{
                fontSize:"12px", fontWeight:"600", marginBottom:"3px",
                color: tone === t.id ? "#ede9fe" : "#a78bfa"
              }}>{t.label}</div>
              <div style={{
                fontSize:"10px",
                color: tone === t.id ? "#c4b5fd" : "rgba(167,139,250,0.5)"
              }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── TEXT INPUT ── */}
      {inputType === "text" && <>
        <button onClick={() => setRawContent(SAMPLE)} style={{
          background:"none", border:"none",
          color:"#a78bfa", fontSize:"12px",
          cursor:"pointer", textAlign:"left", padding:0,
          textDecoration:"underline",
          textDecorationColor:"rgba(167,139,250,0.35)",
          fontFamily:"inherit"
        }}>Load sample content →</button>

        <textarea
          value={rawContent}
          onChange={e => setRawContent(e.target.value)}
          placeholder="Paste your raw product description, article, or any content here..."
          style={{
            flex:1, minHeight:"240px",
            background:"rgba(0,0,0,0.25)",
            border:"1px solid rgba(167,139,250,0.22)",
            borderRadius:"10px", padding:"14px",
            color:"#e9d5ff", fontSize:"13px",
            lineHeight:"1.7", resize:"none", outline:"none",
            fontFamily:"'DM Sans',sans-serif",
            transition:"border-color 0.2s"
          }}
          onFocus={e => e.target.style.borderColor = "rgba(167,139,250,0.5)"}
          onBlur={e  => e.target.style.borderColor = "rgba(167,139,250,0.22)"}
        />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:"11px", color:"#a78bfa" }}>{charCount} chars</span>
          {charCount > 0 && charCount < 50 && (
            <span style={{ fontSize:"11px", color:"#f87171" }}>Min 50 required</span>
          )}
          {charCount >= 50 && (
            <span style={{ fontSize:"11px", color:"#4ade80" }}>✓ Ready</span>
          )}
        </div>
      </>}

      {/* ── URL INPUT ── */}
      {inputType === "url" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"12px" }}>
          <div style={{
            fontSize:"12px", color:"#c4b5fd",
            lineHeight:"1.7", padding:"12px",
            background:"rgba(0,0,0,0.18)",
            border:"1px solid rgba(167,139,250,0.18)",
            borderRadius:"10px"
          }}>
            Paste any public URL — a product page, blog post, or article.
            The scraper extracts readable text automatically.
          </div>

          <div>
            <div style={{
              fontSize:"9.5px", fontWeight:"600",
              letterSpacing:"0.18em", textTransform:"uppercase",
              color:"#a78bfa", marginBottom:"8px"
            }}>URL</div>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/product-page"
              style={{
                width:"100%",
                background:"rgba(0,0,0,0.25)",
                border:`1px solid ${url.startsWith("http")
                  ? "rgba(74,222,128,0.45)" : "rgba(167,139,250,0.22)"}`,
                borderRadius:"10px", padding:"12px 14px",
                color:"#e9d5ff", fontSize:"13px",
                outline:"none", fontFamily:"'DM Sans',sans-serif",
                transition:"border-color 0.2s", boxSizing:"border-box"
              }}
            />
            {url && !url.startsWith("http") && (
              <div style={{ fontSize:"11px", color:"#f87171", marginTop:"6px" }}>
                Must start with http:// or https://
              </div>
            )}
            {url.startsWith("http") && (
              <div style={{ fontSize:"11px", color:"#4ade80", marginTop:"6px" }}>✓ Valid URL</div>
            )}
          </div>

          <div>
            <div style={{
              fontSize:"9.5px", fontWeight:"600",
              letterSpacing:"0.18em", textTransform:"uppercase",
              color:"#a78bfa", marginBottom:"8px"
            }}>Try an example</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
              {[
                "https://openai.com/index/chatgpt",
                "https://vercel.com/blog/v0-is-now-in-general-availability"
              ].map(ex => (
                <button key={ex} onClick={() => setUrl(ex)} style={{
                  background:"rgba(0,0,0,0.18)",
                  border:"1px solid rgba(167,139,250,0.18)",
                  borderRadius:"8px", padding:"9px 12px",
                  color:"#a78bfa", fontSize:"11px",
                  cursor:"pointer", textAlign:"left",
                  fontFamily:"'DM Sans',sans-serif",
                  transition:"all 0.2s", overflow:"hidden",
                  textOverflow:"ellipsis", whiteSpace:"nowrap"
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(109,40,217,0.25)"
                    e.currentTarget.style.color = "#c4b5fd"
                    e.currentTarget.style.borderColor = "rgba(196,181,253,0.35)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.18)"
                    e.currentTarget.style.color = "#a78bfa"
                    e.currentTarget.style.borderColor = "rgba(167,139,250,0.18)"
                  }}
                >⬡ {ex}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DOC INPUT ── */}
      {inputType === "doc" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"12px" }}>
          <div style={{
            fontSize:"12px", color:"#c4b5fd", lineHeight:"1.7",
            padding:"12px",
            background:"rgba(0,0,0,0.18)",
            border:"1px solid rgba(167,139,250,0.18)",
            borderRadius:"10px"
          }}>
            Upload a PDF or TXT file. Max 10MB.
            Scanned or image-based PDFs are not supported.
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              flex:1, minHeight:"200px",
              background: dragOver
                ? "rgba(109,40,217,0.2)"
                : file ? "rgba(74,222,128,0.07)" : "rgba(0,0,0,0.2)",
              border:`2px dashed ${dragOver
                ? "rgba(196,181,253,0.65)"
                : file ? "rgba(74,222,128,0.5)" : "rgba(167,139,250,0.28)"}`,
              borderRadius:"12px",
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              gap:"12px", cursor:"pointer", transition:"all 0.2s"
            }}
          >
            {file ? <>
              <div style={{ fontSize:"32px" }}>📄</div>
              <div style={{
                fontSize:"13px", fontWeight:"500",
                color:"#4ade80", textAlign:"center", padding:"0 16px"
              }}>{file.name}</div>
              <div style={{ fontSize:"11px", color:"rgba(74,222,128,0.7)" }}>
                {(file.size/1024).toFixed(1)} KB · Click to change
              </div>
            </> : <>
              <div style={{ fontSize:"28px", color:"#a78bfa", opacity: dragOver ? 1 : 0.7 }}>⬆</div>
              <div style={{ fontSize:"13px", color:"#a78bfa", textAlign:"center" }}>
                Drag & drop your file here<br/>
                <span style={{ fontSize:"11px", color:"rgba(167,139,250,0.6)" }}>
                  or click to browse
                </span>
              </div>
              <div style={{ display:"flex", gap:"8px" }}>
                {["PDF","TXT"].map(fmt => (
                  <span key={fmt} style={{
                    fontSize:"10px", fontWeight:"600", color:"#a78bfa",
                    background:"rgba(109,40,217,0.2)",
                    border:"1px solid rgba(167,139,250,0.28)",
                    borderRadius:"6px", padding:"3px 8px", letterSpacing:"0.08em"
                  }}>{fmt}</span>
                ))}
              </div>
            </>}
          </div>

          <input
            ref={fileRef} type="file" accept=".pdf,.txt"
            style={{ display:"none" }}
            onChange={e => setFile(e.target.files[0] || null)}
          />

          {file && (
            <button onClick={() => setFile(null)} style={{
              background:"transparent",
              border:"1px solid rgba(248,113,113,0.3)",
              borderRadius:"8px", padding:"7px",
              color:"rgba(248,113,113,0.75)", fontSize:"12px",
              cursor:"pointer", fontFamily:"inherit"
            }}>✕ Remove file</button>
          )}
        </div>
      )}

      {/* ── GENERATE BUTTON ── */}
      <button
        onClick={handleSubmit}
        disabled={!isReady}
        style={{
          background: isReady
            ? "linear-gradient(135deg,#7e22ce,#d946ef)"
            : "rgba(109,40,217,0.12)",
          border:"none", borderRadius:"10px", padding:"14px",
          color: isReady ? "#fff" : "rgba(167,139,250,0.4)",
          fontSize:"14px", fontWeight:"600",
          cursor: isReady ? "pointer" : "not-allowed",
          display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
          transition:"all 0.2s",
          boxShadow: isReady ? "0 0 28px rgba(126,34,206,0.4)" : "none",
          fontFamily:"inherit"
        }}
      >
        {isLoading ? <><Spinner/> Analysing...</>
          : inputType === "text" ? "✦ Analyse Content"
          : inputType === "url"  ? "⬡ Scrape & Analyse"
          : "◈ Parse & Analyse"}
      </button>

    </div>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      style={{animation:"spin 1s linear infinite"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

const SAMPLE = `Introducing TaskFlow 2.0 — the AI-powered project management platform built for modern remote teams.

TaskFlow 2.0 helps distributed teams stay aligned, move faster, and eliminate the chaos of scattered tools. With our new AI assistant, teams can auto-generate project timelines, get smart task prioritization, and receive daily digest summaries — all in one place.

Key Features:
- AI Timeline Generator: Paste your project goals and get a full sprint plan in seconds
- Smart Priority Engine: Automatically ranks tasks based on deadlines, dependencies, and team capacity
- Daily Digest: Every morning, each team member gets a personalized summary of what matters most
- Real-time Collaboration: Live cursors, instant comments, and conflict-free editing

Technical Details:
- Built on React and Node.js with PostgreSQL
- 99.9% uptime SLA, SOC 2 Type II certified
- Available on web and mobile (iOS and Android)

Pricing: Free tier for teams up to 5. Pro at $12/user/month.
Target: Remote-first startups, digital agencies, engineering teams.`