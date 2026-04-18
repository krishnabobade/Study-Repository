const { GoogleGenAI } = require('@google/genai');

let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
const validateAcademicContent = async (req, res, next) => {
  try {
    // If no file is uploaded, skip this (let the controller handle 'no file' errors)
    if (!req.file) return next();

    // Proceed with Gemini analysis for images and PDFs
    // (Note: text/plain can also be analyzed, while word/ppt might need to fall back if not supported inline,
    // though gemini-2.5-flash supports a wide variety. If unsupported, we bypass or handle safely)
    const validMimesForGemini = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/webp',
      'text/plain'
    ];

    if (!validMimesForGemini.includes(req.file.mimetype)) {
      // For heavy DOCX/PPTX formats that might exceed inline limits or lack native buffer support here,
      // we can optionally rely on keyword metadata from standard form fields,
      // but if the user wants strict check, let's assume they passed the mime-type block first.
      // We will skip deep AI validation for formats Gemini doesn't support inline yet.
      return next();
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Bypassing AI academic validation.");
      return next();
    }

    console.log(`Analyzing file content with AI for ${req.file.originalname}...`);

    let inlineData = {
      mimeType: req.file.mimetype,
      data: req.file.buffer.toString('base64')
    };

    const prompt = `
You are a highly strict academic content moderator for a university's Study Repository.
Your job is to reject any files that are NOT genuine study materials.

Examine the provided file content/image:
- ACCEPT: Notes, textbook pages, whiteboards, diagrams, educational files, code, academic papers, presentations, assignments.
- REJECT: Selfies, personal photos, memes, random screenshots not related to study, executable contents, generic non-study graphics, and inappropriate content.

Return ONLY a raw JSON object string with no markdown formatting whatsoever, like this:
{
  "valid": true or false,
  "reason": "If rejected, explain why. If valid, briefly state why."
}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            prompt,
            { inlineData }
        ],
        config: {
            responseMimeType: "application/json",
            temperature: 0.1
        }
    });

    const resultText = response.text;
    let result;
    try {
        result = JSON.parse(resultText);
    } catch (e) {
        console.error("AI returned unparseable JSON:", resultText);
        // Default to safe side if AI returns garbage
        return next();
    }

    if (!result.valid) {
        return res.status(403).json({ 
            success: false, 
            message: `Upload failed due to content restrictions: ${result.reason || "Invalid file type or content detected"}` 
        });
    }

    // Success
    next();

  } catch (error) {
    console.error('AI Validation Error:', error);
    // If the file is too large for the API or another network error occurs,
    // don't completely block the user if it's an infrastructure issue,
    // but log it for debugging.
    next();
  }
};

module.exports = { validateAcademicContent };
