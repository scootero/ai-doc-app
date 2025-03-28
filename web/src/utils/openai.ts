'use server';

import OpenAI from 'openai';
import { Project } from '@/data/projects';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Sends text + images (base64) to GPT-4 Turbo to analyze,
 * suggest where the note belongs, and return a project update.
 */
export async function suggestAndModify(
  note: string,
  projects: Project[],
  pastedImages: string[]
): Promise<string> {
  // ✅ Strip images from projects to reduce token usage
  const cleanProjects = projects.map(({ images, ...rest }) => rest);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        'You are a documentation assistant. The user is submitting a new note, possibly with an image. You must determine where it belongs, and modify the correct project/section accordingly.',
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `
Here is the user's input:
"""${note || '[no text provided]'}"""

Here are the existing projects in JSON:
${JSON.stringify(cleanProjects, null, 2)}

Your task:
1. Decide which project and section this new input belongs in (use image and/or text).
2. If there's no good section, create one.
3. If no project fits, explain why and DO NOT return any JSON.
4. Reformat the note if needed.
5. If image(s) are included, insert image placeholders in this exact format: [[IMAGE_1]], [[IMAGE_2]]. Do not use markdown syntax like ![](IMAGE_1) or embed actual images.
6. Format your content using markdown — use headers, bullet points, line breaks, and clean structure to make it look like a real document.
7. Return:

PROJECT: <project name>
SECTION: <section title>
EXPLANATION: <your reasoning>

SECTION PREVIEW:
\`\`\`markdown
...context before
🆕 <new content>
...context after
\`\`\`

UPDATED_PROJECT_JSON:
\`\`\`json
<only the updated project>
\`\`\`
        `.trim(),
        },
        ...pastedImages.map((img) => ({
          type: 'image_url',
          image_url: { url: img },
        })),
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
    temperature: 0.3,
  });

  return response.choices[0].message.content ?? '';
}
