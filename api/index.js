const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyBywW_rkH-s760T10YXBUrkrGKfssnz1lk";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.post('/analyze', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required in the request body.' });
  }


  const prompt = `
Below is the programming code to analyze:
\`\`\`
${code}
\`\`\`

Please provide a concise analysis in JSON format with the following keys:
{
  "time_complexity": "Time Complexity in Big-O notation (e.g., O(n), O(log n))",
  "space_complexity": "Space Complexity (e.g., O(1), O(n))",
  "workflow": "A brief summary of the code's workflow"
}

**Important:**
- Do not include the original code or any code excerpts in your response.
- Only return a valid JSON object without any additional commentary.
`;


  try {
    const result = await model.generateContent(prompt);
    let responseText = await result.response.text();

    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const analysis = JSON.parse(responseText);

    return res.json({ message: "Analysis complete", analysis: analysis });
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});