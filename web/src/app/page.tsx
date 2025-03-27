'use client';

import React, { useState } from 'react';
import { dummyProjects, Project } from '@/data/projects';

export default function HomePage() {
  const [inputText, setInputText] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const handleSubmit = async () => {
    const simulatedResponse =
      'This content looks like it belongs in the "Product Roadmap" project under "Q1 Goals".';
    setAiResponse(simulatedResponse);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold mb-4">AI-Driven Documentation Assistant</h1>

        {/* Input area for user to paste notes */}
        <textarea
          className="w-full p-3 border rounded-md mb-4 h-40"
          placeholder="Paste or enter your note here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {/* Submit button */}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={handleSubmit}
        >
          Submit to AI
        </button>

        {/* AI response section */}
        {aiResponse && (
          <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-600">
            <strong>AI Suggestion:</strong>
            <p>{aiResponse}</p>
          </div>
        )}

        {/* Dummy projects section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Existing Projects</h2>
          <ul className="space-y-4">
            {dummyProjects.map((project) => (
              <li key={project.id} className="bg-gray-50 p-4 border rounded">
                <h3 className="font-bold">{project.name}</h3>
                <ul className="ml-4 list-disc">
                  {project.sections.map((section, idx) => (
                    <li key={idx}>
                      <strong>{section.title}:</strong> {section.content}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
