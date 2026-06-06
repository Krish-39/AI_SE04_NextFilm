import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

export async function getMovieRecommendations(userPrompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(`
You are an expert movie recommendation AI.

Understand the user's:
- mood
- emotions
- story description
- favorite movie
- themes
- genres

Recommend exactly 5 REAL movies.

Rules:
- Only real movies.
- Prefer popular and highly rated movies.
- Match the user's intent closely.
- Return ONLY movie titles separated by commas.
- No explanations.
- No numbering.
- No bullet points.

User:
"${userPrompt}"
`);

    const response = result.response.text();

    console.log("Gemini Response:", response);

    return response;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
}