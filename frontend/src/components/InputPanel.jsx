// InputPanel.jsx
// This is the LEFT panel where the user pastes their raw content
// and clicks the Generate button

// useState = React hook to store and update values
import { useState } from "react"

// This component receives two "props" (inputs from parent):
// - onGenerate: function to call when user clicks Generate
// - isLoading: boolean - true when API call is in progress
export default function InputPanel({ onGenerate, isLoading }) {

  // useState stores the text the user types
  // rawContent = current value
  // setRawContent = function to update the value
  const [rawContent, setRawContent] = useState("")

  // This function runs when user clicks the Generate button
  const handleSubmit = () => {
    // Don't submit if empty
    if (!rawContent.trim()) {
      alert("Please paste some content first!")
      return
    }
    // Call the onGenerate function passed from App.jsx
    // and send the raw content to it
    onGenerate(rawContent)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 h-full">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          📄 Raw Content Input
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Paste your product description, article, or any raw content below.
          Our AI agents will handle the rest.
        </p>
      </div>

      {/* Sample content button - helps user test quickly */}
      <button
        onClick={() => setRawContent(SAMPLE_CONTENT)}
        className="text-xs text-blue-600 underline text-left hover:text-blue-800"
      >
        Load sample content for testing →
      </button>

      {/* Text area where user pastes content */}
      <textarea
        className="flex-1 border border-gray-200 rounded-xl p-4 text-sm 
                   text-gray-700 resize-none focus:outline-none focus:ring-2 
                   focus:ring-blue-400 min-h-[300px]"
        placeholder="Paste your raw product description, technical article, 
or any content here...

Example:
We just launched TaskFlow 2.0, an AI-powered project management tool 
designed for remote teams..."
        value={rawContent}
        onChange={(e) => setRawContent(e.target.value)}
        // onChange fires every time user types
        // e.target.value = the current text in the textarea
        // setRawContent updates our stored value
      />

      {/* Character count - helps user know how much they've written */}
      <p className="text-xs text-gray-400 text-right">
        {rawContent.length} characters
        {rawContent.length < 50 && rawContent.length > 0 && (
          <span className="text-red-400 ml-2">
            (minimum 50 characters required)
          </span>
        )}
      </p>

      {/* Generate Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || rawContent.length < 50}
        // disabled = button is unclickable when loading or content too short
        className={`w-full py-3 px-6 rounded-xl font-semibold text-white 
                   transition-all duration-200
                   ${isLoading || rawContent.length < 50
                     ? "bg-gray-300 cursor-not-allowed"       // Greyed out when disabled
                     : "bg-blue-600 hover:bg-blue-700 cursor-pointer"  // Blue when active
                   }`}
      >
        {isLoading ? (
          // Show spinner animation when loading
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" 
                      stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" 
                    d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Agents Working...
          </span>
        ) : (
          "🚀 Generate Content"
        )}
      </button>

    </div>
  )
}

// Sample content for testing
// This is defined outside the component so it doesn't re-create on every render
const SAMPLE_CONTENT = `Introducing TaskFlow 2.0 — the AI-powered project management platform built for modern remote teams.

TaskFlow 2.0 helps distributed teams stay aligned, move faster, and eliminate the chaos of scattered tools. With our new AI assistant, teams can auto-generate project timelines, get smart task prioritization, and receive daily digest summaries — all in one place.

Key Features:
- AI Timeline Generator: Paste your project goals and get a full sprint plan in seconds
- Smart Priority Engine: Automatically ranks tasks based on deadlines, dependencies, and team capacity  
- Daily Digest: Every morning, each team member gets a personalized summary of what matters most
- Real-time Collaboration: Live cursors, instant comments, and conflict-free editing
- Integrations: Connects with Slack, GitHub, Figma, and Google Workspace

Technical Details:
- Built on React and Node.js with a PostgreSQL database
- 99.9% uptime SLA with enterprise-grade security
- SOC 2 Type II certified
- Available as web app and mobile (iOS and Android)
- REST API and webhooks available for custom integrations

Pricing: Free tier available for teams up to 5 members. Pro plan at $12/user/month.

Target users: Remote-first startups, digital agencies, and engineering teams at mid-size companies.`