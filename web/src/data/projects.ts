// Dummy project data to simulate saved documentation.
// Each project has a title and some placeholder content (sections and notes).

export type Section = {
  title: string;
  content: string;
  images?: string[]; // Add this
};


export type Project = {
  id: string;
  name: string;
  sections: { title: string; content: string }[];
  images?: string[]; // ✅ Add this line
};


export const dummyProjects: Project[] = [
  {
    id: "1",
    name: "Marketing Strategy",
    sections: [
      { title: "Overview", content: "This document outlines our Q1 marketing strategy..." },
      { title: "Social Media", content: "Focus on Instagram and TikTok growth." }
    ],
  },
  {
    id: "2",
    name: "Product Roadmap",
    sections: [
      { title: "Q1 Goals", content: "Improve onboarding flow and add AI suggestions." },
      { title: "Stretch Goals", content: "Mobile-friendly version and performance improvements." }
    ],
  },
];
