import { useState, useEffect } from "react"

export default function FactSheetPanel({
  factSheet, isLoading, onConfirm,
  isLoadingStep2, step, theme: T
}) {
  const [edited, setEdited] = useState(null)

  // When fact sheet arrives, initialize editable copy
  useEffect(() => {
    if (factSheet) setEdited({ ...factSheet })
  }, [factSheet])

  if (isLoading) return (
    <Panel T={T}>
      <Loader label="Agent 1 analysing..." color="#c084fc" />
    </Panel>
  )

  if (!factSheet || !edited) return (
    <Panel T={T}>
      <Empty icon="◈" title="Fact Sheet" sub="Appears after analysis" />
    </Panel>
  )

  const updateField = (key, value) => setEdited(prev => ({ ...prev, [key]: value }))

  const updateListItem = (key, index, value) => {
    const arr = [...edited[key]]
    arr[index] = value
    setEdited(prev => ({ ...prev, [key]: arr }))
  }

  const addListItem = (key) => setEdited(prev => ({ ...prev, [key]: [...prev[key], ""] }))
  const removeListItem = (key, index) => setEdited(prev => ({
    ...prev, [key]: prev[key].filter((_, i) => i !== index)
  }))

  return (
    <Panel T={T} scroll>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "rgba(192,132,252,0.12)",
            border: "1px solid rgba(192,132,252,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>◈</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: T.text }}>
              Fact Sheet
            </div>
            <div style={{ fontSize: "11px", color: "#4ade80" }}>✓ Agent 1 complete</div>
          </div>
        </div>
        <div style={{
          fontSize: "10px", color: "rgba(192,132,252,0.5)",
          background: "rgba(192,132,252,0.08)",
          border: "1px solid rgba(192,132,252,0.15)",
          borderRadius: "6px", padding: "4px 8px"
        }}>
          Editable
        </div>
      </div>

      <div style={{ height: "1px", background: T.border }}/>

      {/* Product name */}
      <Field label="Product / Title" color={T.cyan}>
        <input
          value={edited.product_name}
          onChange={e => updateField("product_name", e.target.value)}
          style={inputStyle(T)}
        />
      </Field>

      {/* Tone (read-only display) */}
      <Field label="Tone" color={T.cyan}>
        <div style={{
          padding: "8px 12px",
          background: "rgba(155,77,255,0.1)",
          border: "1px solid rgba(155,77,255,0.25)",
          borderRadius: "8px",
          fontSize: "13px", color: "#a78bfa",
          fontWeight: "500", textTransform: "capitalize"
        }}>
          {edited.tone}
        </div>
      </Field>

      {/* Target audience */}
      <Field label="Target Audience" color={T.cyan}>
        <textarea
          value={edited.target_audience}
          onChange={e => updateField("target_audience", e.target.value)}
          rows={2}
          style={{ ...inputStyle(T), resize: "none" }}
        />
      </Field>

      {/* Value proposition */}
      <Field label="Value Proposition" color={T.cyan}>
        <textarea
          value={edited.value_proposition}
          onChange={e => updateField("value_proposition", e.target.value)}
          rows={2}
          style={{ ...inputStyle(T), resize: "none" }}
        />
      </Field>

      {/* Core features */}
      <Field label="Core Features" color={T.cyan}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {edited.core_features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "6px" }}>
              <input
                value={f}
                onChange={e => updateListItem("core_features", i, e.target.value)}
                style={{ ...inputStyle(T), flex: 1 }}
              />
              <button
                onClick={() => removeListItem("core_features", i)}
                style={removeBtn(T)}
              >✕</button>
            </div>
          ))}
          <button onClick={() => addListItem("core_features")} style={addBtn(T)}>
            + Add feature
          </button>
        </div>
      </Field>

      {/* Technical specs */}
      <Field label="Technical Specs" color={T.cyan}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {edited.technical_specs.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "6px" }}>
              <input
                value={s}
                onChange={e => updateListItem("technical_specs", i, e.target.value)}
                style={{ ...inputStyle(T), flex: 1 }}
              />
              <button
                onClick={() => removeListItem("technical_specs", i)}
                style={removeBtn(T)}
              >✕</button>
            </div>
          ))}
          <button onClick={() => addListItem("technical_specs")} style={addBtn(T)}>
            + Add spec
          </button>
        </div>
      </Field>

      {/* Flagged claims */}
      {edited.ambiguous_flags?.length > 0 && (
        <Field label="⚠ Flagged Claims" color={T.amber}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {edited.ambiguous_flags.map((flag, i) => (
              <div key={i} style={{
                background: "rgba(251,191,36,0.06)",
                border: "1px solid rgba(251,191,36,0.2)",
                borderRadius: "8px", padding: "8px 10px",
                display: "flex", gap: "8px", alignItems: "flex-start"
              }}>
                <span style={{ fontSize: "11px", color: T.amber, flex: 1 }}>
                  {flag}
                </span>
                <button
                  onClick={() => removeListItem("ambiguous_flags", i)}
                  style={removeBtn(T)}
                >✕</button>
              </div>
            ))}
          </div>
        </Field>
      )}

      {/* Confirm button */}
      <button
        onClick={() => onConfirm(edited)}
        disabled={isLoadingStep2}
        style={{
          background: isLoadingStep2 ? "rgba(155,77,255,0.1)" : T.primaryGrad,
          border: "none", borderRadius: "10px", padding: "14px",
          color: isLoadingStep2 ? T.textDim : "#fff",
          fontSize: "14px", fontWeight: "600",
          cursor: isLoadingStep2 ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: "8px",
          boxShadow: isLoadingStep2 ? "none" : "0 0 24px rgba(155,77,255,0.3)"
        }}
      >
        {isLoadingStep2
          ? <><Spinner /> Writing content...</>
          : "✦ Generate Content →"}
      </button>

    </Panel>
  )
}

// ── Helpers ──

function Panel({ children, T, scroll }) {
  return (
    <div style={{
      background: `rgba(150,80,255,0.05)`,
      border: `1px solid rgba(150,80,255,0.15)`,
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

function Field({ label, color, children }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.2)",
      border: "1px solid rgba(150,80,255,0.1)",
      borderRadius: "10px", padding: "12px"
    }}>
      <div style={{
        fontSize: "9px", fontWeight: "700",
        color: color || "#c084fc",
        letterSpacing: "0.15em", textTransform: "uppercase",
        marginBottom: "8px"
      }}>{label}</div>
      {children}
    </div>
  )
}

function Empty({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: "32px", color: "rgba(150,80,255,0.2)", marginBottom: "12px" }}>
        {icon}
      </div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: "rgba(255,255,255,0.15)", marginBottom: "6px" }}>
        {title}
      </div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.08)" }}>{sub}</div>
    </div>
  )
}

function Loader({ label, color }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        border: `2px solid ${color}20`,
        borderTop: `2px solid ${color}`,
        margin: "0 auto 14px",
        animation: "spin 1s linear infinite"
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontSize: "13px", color }}>{label}</div>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      style={{ animation: "spin 1s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

const inputStyle = () => ({
  width:"100%", background:"rgba(0,0,0,0.25)",
  border:"1px solid rgba(167,139,250,0.22)",
  borderRadius:"8px", padding:"8px 10px",
  color:"#e9d5ff",
  fontSize:"13px", outline:"none",
  fontFamily:"'DM Sans',sans-serif",
  boxSizing:"border-box", lineHeight:"1.6"
})

const removeBtn = (T) => ({
  background: "transparent",
  border: "1px solid rgba(248,113,113,0.2)",
  borderRadius: "6px", padding: "4px 8px",
  color: "rgba(248,113,113,0.5)", fontSize: "10px",
  cursor: "pointer", flexShrink: 0
})

const addBtn = (T) => ({
  background: "transparent",
  border: "1px dashed rgba(150,80,255,0.2)",
  borderRadius: "8px", padding: "6px",
  color: "rgba(150,80,255,0.5)", fontSize: "12px",
  cursor: "pointer", width: "100%"
})