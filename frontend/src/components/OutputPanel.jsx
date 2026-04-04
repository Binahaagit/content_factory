// OutputPanel.jsx
// Shows the 3 generated content pieces from Agent 2

// useState for managing which tab is active
import { useState } from "react"

export default function OutputPanel({ generatedContent }) {

  // Track which tab the user is viewing
  // "blog" | "social" | "email"
  const [activeTab, setActiveTab] = useState("blog")

  if (!generatedContent) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex 
                      flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4">✍️</div>
        <h3 className="text-lg font-semibold text-gray-400">
          Agent 2 Output
        </h3>
        <p className="text-sm text-gray-300 mt-2">
          Generated content will appear here after generation
        </p>
      </div>
    )
  }

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">✍️</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Generated Content</h2>
          <p className="text-xs text-green-600 font-medium">✅ Agent 2 Complete</p>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2">
        {[
          { id: "blog", label: "📝 Blog Post" },
          { id: "social", label: "📱 Social" },
          { id: "email", label: "📧 Email" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                       ${activeTab === tab.id
                         ? "bg-blue-600 text-white"      // Active tab style
                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"  // Inactive
                       }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Blog Post Tab */}
        {activeTab === "blog" && (
          <div className="flex flex-col gap-3 h-full">
            <div className="flex justify-end">
              <CopyButton onClick={() => copyToClipboard(generatedContent.blog_post)} />
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 
                           leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto">
              {/* whitespace-pre-wrap preserves line breaks in the text */}
              {generatedContent.blog_post}
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === "social" && (
          <div className="flex flex-col gap-3">
            {generatedContent.social_media_thread.map((post, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 flex 
                                         flex-col gap-2 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600">
                    Post {index + 1} of 5
                  </span>
                  <CopyButton onClick={() => copyToClipboard(post)} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{post}</p>
                <p className="text-xs text-gray-400 text-right">
                  {post.length}/280 chars
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Email Tab */}
        {activeTab === "email" && (
          <div className="flex flex-col gap-3 h-full">
            <div className="flex justify-end">
              <CopyButton onClick={() => copyToClipboard(generatedContent.email_teaser)} />
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 
                           leading-relaxed flex-1">
              {generatedContent.email_teaser}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// Reusable copy button component
function CopyButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 
                 px-3 py-1 rounded-lg transition-all"
    >
      📋 Copy
    </button>
  )
}