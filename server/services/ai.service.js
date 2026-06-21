const { GoogleGenAI } = require('@google/genai');
const logger = require('../config/logger');

let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  logger.warn('GEMINI_API_KEY is not defined. AI Summarizer will use simulated fallbacks.');
}

/**
 * Generates an AI summary and relevant tags for an uploaded document/image using Gemini.
 * @param {Buffer} fileBuffer - The file raw buffer.
 * @param {string} mimeType - The mime-type of the uploaded file.
 * @param {object} metadata - Details such as title, subject, category to assist processing.
 * @returns {Promise<{summary: string, tags: string[]}>}
 */
const generateSummaryAndTags = async (fileBuffer, mimeType, metadata = {}) => {
  const { title = '', subject = '', category = '', course = '' } = metadata;
  
  // Default simulated fallback
  const mockSummary = `This is a ${category || 'study'} resource covering topics on ${subject || title || 'the subject'}. Automatically processed for ${course || 'MIT-WPU'} students.`;
  const mockTags = [subject, category, course].map(t => t?.toLowerCase().trim()).filter(Boolean);

  if (!ai) {
    return {
      summary: mockSummary,
      tags: [...new Set(mockTags)]
    };
  }

  // Ensure mime type is supported by Gemini inlineData
  const supportedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain'
  ];

  if (!supportedMimeTypes.includes(mimeType)) {
    logger.info(`Mime type "${mimeType}" is not supported inline by Gemini. Using simulated fallback.`);
    return {
      summary: mockSummary,
      tags: [...new Set(mockTags)]
    };
  }

  try {
    const inlineData = {
      mimeType,
      data: fileBuffer.toString('base64')
    };

    const prompt = `
You are an expert academic AI system assisting university students.
Analyze the uploaded document or image carefully.
Produce:
1. A concise academic summary (maximum 3-4 sentences) explaining the key topics, concepts, and educational value of this resource.
2. A list of 5-8 highly relevant tags or keywords (such as subject area, course name, chapter names, or specific technologies/theories discussed).

Context of this resource:
- Title: "${title}"
- Subject: "${subject}"
- Category: "${category}"

Return your response ONLY as a raw JSON object string with no markdown formatting whatsoever, matching this JSON schema:
{
  "summary": "string",
  "tags": ["string"]
}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        { inlineData }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const resultText = response.text;
    const result = JSON.parse(resultText);

    if (result && result.summary) {
      return {
        summary: result.summary,
        tags: Array.isArray(result.tags) ? result.tags : mockTags
      };
    }

    return {
      summary: mockSummary,
      tags: [...new Set(mockTags)]
    };

  } catch (err) {
    logger.error('Gemini summarization failed:', err);
    return {
      summary: mockSummary,
      tags: [...new Set(mockTags)]
    };
  }
};

module.exports = {
  generateSummaryAndTags
};
