import { useState, useCallback } from "react"
import axios from "axios"
import InputPanel from "./components/InputPanel"
import FactSheetPanel from "./components/FactSheetPanel"
import OutputPanel from "./components/OutputPanel"

export default function App() {

  const [isLoading, setIsLoading] = useState(false)
  const [factSheet, setFactSheet] = useState(null)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerate = useCallback(async (rawContent) => {
    setIsLoading(true)
    setError(null)
    setFactSheet(null)
    setGeneratedContent(null)

    try {
      const response = await axios.post("/api/generate", {
        raw_content: rawContent
      })
      const result = response.data
      if (result.success) {
        setFactSheet(result.fact_sheet)
        setGeneratedContent(result.generated_content)
      } else {
        setError("Generation failed. Please try again.")
      }
    } catch (err) {
      console.error("API Error:", err)
      const errorMsg = err.response?.data?.detail || "Something went wrong. Please try again."
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">

      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          🏭 Autonomous Content Factory
        </h1>
        <p className="text-gray-500 mt-1">
          Two AI agents working together — fact-check → generate → publish ready
        </p>
        <div className="flex items-center gap-2 mt-3 text-sm">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            Agent 1: Fact Checker
          </span>
          <span className="text-gray-400">→</span>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
            Agent 2: Copywriter
          </span>
          <span className="text-gray-400">→</span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            3 Platform Outputs
          </span>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mb-4 bg-red-50 border border-red-200
                        text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <span>❌</span>
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            ✕
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[75vh]">
        <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />
        <FactSheetPanel factSheet={factSheet} />
        <OutputPanel generatedContent={generatedContent} />
      </div>

    </div>
  )
}