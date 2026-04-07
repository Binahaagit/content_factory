import { useState, useCallback } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import InputPanel from "../components/InputPanel"
import FactSheetPanel from "../components/FactSheetPanel"
import OutputPanel from "../components/OutputPanel"

export const THEME = {
  bg:          "linear-gradient(160deg, #2d0050 0%, #3b0764 40%, #4a0e82 70%, #3b0764 100%)",
  surface:     "rgba(100,30,160,0.12)",
  surfaceHov:  "rgba(120,40,190,0.2)",
  border:      "rgba(180,120,255,0.16)",
  borderHov:   "rgba(210,165,255,0.28)",
  primary:     "#9333ea",
  primaryGrad: "linear-gradient(135deg,#7e22ce,#d946ef)",
  text:        "#e9d5ff",          // ← was rgba(230,200,255,0.85) — now solid lavender
  textMuted:   "#c4b5fd",          // ← was rgba(200,165,255,0.6) — now solid violet
  textDim:     "rgba(196,181,253,0.55)", // ← was 0.35 — bumped up
  accent1:     "#d8b4fe",          // ← brighter purple
  accent2:     "#e879f9",
  accent3:     "#f472b6",
  green:       "#4ade80",
  red:         "#f87171",
  amber:       "#fbbf24",
  navBg:       "rgba(20,4,40,0.88)"
}

function Logo() {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate("/")} style={{
      display:"flex", alignItems:"center", gap:"10px", cursor:"pointer"
    }}>
      <div style={{
        width:"30px", height:"30px", borderRadius:"7px",
        background:"linear-gradient(135deg,#9333ea,#d946ef)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Cormorant Garamond',serif",
        fontSize:"16px", fontWeight:"600", color:"rgba(255,255,255,0.9)"
      }}>W</div>
      <span style={{
        fontSize:"13px", fontWeight:"500",
        letterSpacing:"0.12em", textTransform:"uppercase",
        color:"rgba(220,180,255,0.6)",
        fontFamily:"'DM Sans',sans-serif"
      }}>WordLoom</span>
    </div>
  )
}

export default function AppPage() {
  const [step, setStep]                     = useState(1)
  const [tone, setTone]                     = useState("professional")
  const [isLoadingStep1, setIsLoadingStep1] = useState(false)
  const [isLoadingStep2, setIsLoadingStep2] = useState(false)
  const [factSheet, setFactSheet]           = useState(null)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [error, setError]                   = useState(null)

  const handleStep1 = useCallback(async (rawContent, file = null) => {
    setIsLoadingStep1(true)
    setError(null); setFactSheet(null); setGeneratedContent(null); setStep(1)

    try {
      let res

      if (rawContent.startsWith("__URL__::")) {
        // URL input — call /generate-url endpoint
        const url = rawContent.replace("__URL__::", "")
        res = await axios.post("/api/generate-url", { url, tone })
        // URL endpoint runs both agents — jump straight to step 3
        if (res.data.success) {
          setFactSheet(res.data.fact_sheet)
          setGeneratedContent(res.data.generated_content)
          setStep(3)
        }

      } else if (rawContent.startsWith("__DOC__::") && file) {
        // Doc input — call /generate-doc endpoint with multipart form
        const formData = new FormData()
        formData.append("file", file)
        res = await axios.post(`/api/generate-doc?tone=${tone}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        // Doc endpoint runs both agents — jump straight to step 3
        if (res.data.success) {
          setFactSheet(res.data.fact_sheet)
          setGeneratedContent(res.data.generated_content)
          setStep(3)
        }

      } else {
        // Normal text input — run step 1 only
        res = await axios.post("/api/generate-step1", { raw_content: rawContent, tone })
        if (res.data.success) {
          setFactSheet(res.data.fact_sheet)
          setStep(2)
        }
      }

      if (!res?.data?.success) setError("Generation failed. Please try again.")

    } catch(err) {
      setError(err.response?.data?.detail || "Something went wrong.")
    } finally {
      setIsLoadingStep1(false)
    }
  }, [tone])

  const handleStep2 = useCallback(async (editedFactSheet) => {
    setIsLoadingStep2(true); setError(null); setGeneratedContent(null)
    try {
      const res = await axios.post("/api/generate-step2", { fact_sheet: editedFactSheet })
      if (res.data.success) {
        setGeneratedContent(res.data.generated_content)
        setFactSheet(res.data.fact_sheet); setStep(3)
      } else setError("Agent 2 failed. Please try again.")
    } catch(err) {
      setError(err.response?.data?.detail || "Something went wrong.")
    } finally { setIsLoadingStep2(false) }
  }, [])

  const handleRegenerate = useCallback(async (outputType) => {
    if (!factSheet) return
    try {
      const res = await axios.post("/api/regenerate", { fact_sheet: factSheet, output_type: outputType })
      if (res.data.success) {
        setGeneratedContent(prev => {
          const u = { ...prev }
          if (outputType === "blog")   u.blog_post = res.data.content
          if (outputType === "email")  u.email_teaser = res.data.content
          if (outputType === "social") {
            try { u.social_media_thread = JSON.parse(res.data.content) }
            catch { /* keep old */ }
          }
          return u
        })
      }
    } catch(err) { setError(err.response?.data?.detail || "Regeneration failed.") }
  }, [factSheet])

  const T = THEME

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing:border-box; }
        body, html { margin:0; padding:0; font-family:'DM Sans',sans-serif; }
        .app-wrap {
          min-height:100vh;
          background: linear-gradient(160deg,#2d0050 0%,#3b0764 40%,#4a0e82 70%,#3b0764 100%);
          display:flex; flex-direction:column;
          font-family:'DM Sans',sans-serif;
        }
        .app-wrap::before {
          content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
  background-image:
    linear-gradient(rgba(255,220,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,220,255,0.04) 1px, transparent 1px);
  background-size:72px 72px;
        }

        /* Panel scroll */
        .app-panel::-webkit-scrollbar { width:4px; }
        .app-panel::-webkit-scrollbar-track { background:transparent; }
        .app-panel::-webkit-scrollbar-thumb { background:rgba(150,80,255,0.2); border-radius:2px; }
        .app-panel::-webkit-scrollbar-thumb:hover { background:rgba(180,100,255,0.4); }

        /* Input styling inside panels */
        .pfield-input {
  width:100%; background:rgba(0,0,0,0.25);
  border:1px solid rgba(160,100,255,0.25);
  border-radius:8px; padding:8px 10px;
  color:#e9d5ff;
  font-size:13px; outline:none;
  font-family:'DM Sans',sans-serif;
  transition:border-color 0.2s; box-sizing:border-box;
}
.pfield-input:focus { border-color:rgba(196,181,253,0.5); }
.pfield-input::placeholder { color:rgba(196,181,253,0.35); }
      `}</style>

      <div className="app-wrap">

        {/* NAV */}
        <nav style={{
          position:"relative", zIndex:10, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"14px 28px",
          background:"rgba(20,4,40,0.88)",
          backdropFilter:"blur(28px)",
          borderBottom:"1px solid rgba(160,100,255,0.12)"
        }}>
          <Logo />

          {/* Step indicators */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            {[
              { n:1, label:"Analyse",  color:"#c084fc" },
              { n:2, label:"Review",   color:"#e879f9" },
              { n:3, label:"Generate", color:"#f472b6" }
            ].map((s, i) => (
              <div key={s.n} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{
                  display:"flex", alignItems:"center", gap:"6px",
                  padding:"5px 12px",
                  background: step >= s.n ? `${s.color}18` : "transparent",
                  border:`1px solid ${step >= s.n ? s.color+"40" : "rgba(160,100,255,0.12)"}`,
                  borderRadius:"100px", transition:"all 0.3s"
                }}>
                  <div style={{
                    width:"6px", height:"6px", borderRadius:"50%",
                    background: step >= s.n ? s.color : "rgba(160,100,255,0.2)"
                  }}/>
                  <span style={{
                    fontSize:"11px", fontWeight:"500",
                    color: step >= s.n ? s.color : "rgba(160,100,255,0.3)"
                  }}>{s.label}</span>
                </div>
                {i < 2 && (
                  <span style={{ color:"rgba(160,100,255,0.2)", fontSize:"14px" }}>→</span>
                )}
              </div>
            ))}
          </div>

          {step > 1
            ? <button onClick={() => { setStep(1); setFactSheet(null); setGeneratedContent(null); setError(null) }}
                style={{
                  background:"transparent",
                  border:"1px solid rgba(160,100,255,0.2)",
                  borderRadius:"8px", padding:"6px 14px",
                  color:"rgba(200,160,255,0.45)", fontSize:"12px", cursor:"pointer",
                  fontFamily:"inherit"
                }}>↺ Reset</button>
            : <div style={{width:"80px"}}/>
          }
        </nav>

        {/* Error */}
        {error && (
          <div style={{
            position:"relative", zIndex:10, margin:"10px 16px 0",
            background:"rgba(248,113,113,0.07)",
            border:"1px solid rgba(248,113,113,0.2)",
            borderRadius:"10px", padding:"11px 16px",
            display:"flex", alignItems:"flex-start", gap:"10px"
          }}>
            <span style={{color:"#f87171",flexShrink:0}}>❌</span>
            <p style={{color:"#fca5a5",fontSize:"13px",lineHeight:"1.5",flex:1}}>{error}</p>
            <button onClick={() => setError(null)} style={{
              background:"none",border:"none",
              color:"rgba(248,113,113,0.35)",cursor:"pointer",fontSize:"16px"
            }}>✕</button>
          </div>
        )}

        {/* Panels */}
        <div style={{
          flex:1, display:"grid",
          gridTemplateColumns:"1fr 1fr 1fr",
          gap:"12px", padding:"12px 16px 16px",
          position:"relative", zIndex:1, minHeight:0
        }}>
          <InputPanel
            onGenerate={handleStep1}
            isLoading={isLoadingStep1}
            tone={tone} onToneChange={setTone}
            theme={T}
          />
          <FactSheetPanel
            factSheet={factSheet}
            isLoading={isLoadingStep1}
            onConfirm={handleStep2}
            isLoadingStep2={isLoadingStep2}
            step={step} theme={T}
          />
          <OutputPanel
            generatedContent={generatedContent}
            isLoading={isLoadingStep2}
            onRegenerate={handleRegenerate}
            factSheet={factSheet} theme={T}
          />
        </div>

      </div>
    </>
  )
}