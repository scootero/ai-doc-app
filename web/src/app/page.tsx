'use client';

import React, { useEffect, useState } from 'react';
import { dummyProjects, Project } from '@/data/projects';
import { suggestAndModify } from '@/utils/openai';
import { loadProjects, saveProjects } from '@/utils/storage';

// Helper to render image placeholders
function renderWithImages(content: string, images: string[] = []) {
  const parts = content.split(/(\[\[IMAGE_\d+\]\])/g);
  return parts.map((part, index) => {
    const match = part.match(/\[\[IMAGE_(\d+)\]\]/);
    if (match) {
      const imgIndex = parseInt(match[1], 10) - 1;
      const imgSrc = images[imgIndex];
      if (imgSrc) {
        return (
          <img
            key={index}
            src={imgSrc}
            alt={`image-${imgIndex + 1}`}
            className="my-2 max-w-full rounded shadow"
          />
        );
      }
    }
    return <span key={index}>{part}</span>;
  });
}

export default function HomePage() {
  const [inputText, setInputText] = useState('');
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [highlightedSection, setHighlightedSection] = useState<{ projectId: string; sectionTitle: string } | null>(null);
  const [suggestion, setSuggestion] = useState(null);
  const [undoState, setUndoState] = useState<Project | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    const stored = loadProjects(dummyProjects);
    setProjects(stored);
  }, []);

  const handleEditProject = (project: Project) => {
    const content = project.sections.map(sec => `### ${sec.title}\n${sec.content}`).join('\n\n');
    setEditedContent(content);
    setEditingProjectId(project.id);
  };

  const handleSaveEdit = () => {
    if (!editingProjectId) return;

    const updatedSections = editedContent
      .split(/### /)
      .filter(Boolean)
      .map(section => {
        const [titleLine, ...rest] = section.split('\n');
        return {
          title: titleLine.trim(),
          content: rest.join('\n').trim(),
        };
      });

    const updatedProjects = projects.map(p =>
      p.id === editingProjectId ? { ...p, sections: updatedSections } : p
    );

    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setEditingProjectId(null);
    setEditedContent('');
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditedContent('');
  };

  const handleCreateProject = () => {
    if (!creatingProject) {
      setInputText('Project Name: \nOverview: ');
      setCreatingProject(true);
      return;
    }

    const nameMatch = inputText.match(/Project Name:\s*(.+)/i);
    const overviewMatch = inputText.match(/Overview:\s*(.+)/i);

    if (!nameMatch || !overviewMatch || nameMatch[1].trim() === '' || overviewMatch[1].trim().includes('Tell me what')) {
      alert('Please provide both a project name and a real overview.');
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: nameMatch[1].trim(),
      sections: [
        {
          title: 'Overview',
          content: overviewMatch[1].trim(),
        },
      ],
    };

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setCreatingProject(false);
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-blue-400">AI Documents Helper Buddy Bud</h1>

        <div className="w-full border border-gray-600 rounded-md mb-4 h-40 bg-gray-700 relative shadow-inner">
  <textarea
    className="w-full h-full p-3 resize-none outline-none bg-transparent text-white placeholder-gray-400"
    placeholder="Paste or drop images and/or text here..."
    value={inputText}
    onChange={(e) => setInputText(e.target.value)}
  />
  {pastedImages.length > 0 && (
    <div className="absolute bottom-2 right-2 flex gap-2">
      {pastedImages.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`preview-${idx}`}
          className="w-12 h-12 object-cover rounded shadow-md border border-gray-600"
        />
      ))}
    </div>
  )}
</div>

<div className="flex items-center justify-between gap-4 mb-6">
  <button
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
    onClick={() => {}}
    disabled={loading || (!inputText.trim() && pastedImages.length === 0)}
  >
    {loading ? 'Thinking...' : 'Submit to AI'}
  </button>

  <button
    className={`px-4 py-2 rounded transition ${creatingProject ? 'bg-gray-700 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}
    onClick={handleCreateProject}
  >
    {creatingProject ? 'Create!' : 'New Project'}
  </button>
</div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-300">Existing Projects</h2>
          <ul className="space-y-4">
            {projects.map((project) => (
              <li
                key={project.id}
                onClick={() => {
                  if (editingProjectId !== project.id) handleEditProject(project);
                }}
                className="bg-gray-800 p-4 border border-gray-600 rounded-lg shadow-sm cursor-pointer hover:border-blue-400 transition-all"
              >
                <h3 className="font-bold text-lg text-blue-400">{project.name}</h3>
                {editingProjectId === project.id ? (
                  <div className="mt-2">
                    <textarea
                      className="w-full h-40 p-2 bg-gray-900 text-white border border-gray-500 rounded"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className="ml-4 list-disc text-sm">
                    {project.sections.map((section, idx) => (
                      <li key={idx} className="text-white">
                        <strong>{section.title}:</strong> {renderWithImages(section.content, section.images)}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
