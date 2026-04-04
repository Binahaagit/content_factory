// FactSheetPanel.jsx
// Shows the structured Fact Sheet produced by Agent 1
// This is the "middle" panel

export default function FactSheetPanel({ factSheet }) {
  
  // If no fact sheet yet, show placeholder
  if (!factSheet) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex 
                      flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-400">
          Agent 1 Output
        </h3>
        <p className="text-sm text-gray-300 mt-2">
          Fact Sheet will appear here after generation
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full overflow-y-auto flex flex-col gap-5">
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔍</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Fact Sheet</h2>
          <p className="text-xs text-green-600 font-medium">✅ Agent 1 Complete</p>
        </div>
      </div>

      {/* Product Name */}
      <Section title="Product / Title">
        <p className="text-gray-800 font-semibold">{factSheet.product_name}</p>
      </Section>

      {/* Target Audience */}
      <Section title="Target Audience">
        <p className="text-gray-700 text-sm">{factSheet.target_audience}</p>
      </Section>

      {/* Value Proposition */}
      <Section title="Value Proposition">
        <p className="text-gray-700 text-sm italic">"{factSheet.value_proposition}"</p>
      </Section>

      {/* Core Features */}
      <Section title="Core Features">
        <ul className="space-y-1">
          {factSheet.core_features.map((feature, index) => (
            // key={index} is required by React when rendering lists
            // It helps React track which items changed
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">→</span>
              {feature}
            </li>
          ))}
        </ul>
      </Section>

      {/* Technical Specs */}
      {factSheet.technical_specs.length > 0 && (
        <Section title="Technical Specs">
          <ul className="space-y-1">
            {factSheet.technical_specs.map((spec, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">⚙</span>
                {spec}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Ambiguous Flags */}
      {factSheet.ambiguous_flags.length > 0 && (
        <Section title="⚠️ Flagged Claims">
          <ul className="space-y-1">
            {factSheet.ambiguous_flags.map((flag, index) => (
              <li key={index} className="text-sm text-amber-700 bg-amber-50 
                                        rounded-lg p-2 flex items-start gap-2">
                <span>⚠️</span>
                {flag}
              </li>
            ))}
          </ul>
        </Section>
      )}

    </div>
  )
}

// Reusable Section component
// Used above to avoid repeating the same div structure
function Section({ title, children }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
      {/* children = whatever is passed between <Section>...</Section> tags */}
    </div>
  )
}