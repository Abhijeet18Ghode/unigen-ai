import mongooseConnection from '../../../lib/mongoose';
import mockInterviewSchema from '../../../model/mockInterview';
import { chatSession } from '../../../utils/geminiAi';

export async function POST(req) {
  try {
    // Parse the request body using req.json()
    const { jobPosition, jobDesc, jobExperience, createdBy } = await req.json();

    // Validate input
    if (!jobPosition || !jobDesc || !jobExperience || !createdBy) {
      return new Response(JSON.stringify({ success: false, message: "Missing required fields" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Connect to MongoDB
    await mongooseConnection();

    // Create the input prompt for the AI model
    const inputPrompt = `Job position: ${jobPosition}, Job Description: ${jobDesc}, Job Experience: ${jobExperience}. Based on this prompt, give me 10 questions and answers in JSON format with each entry in a question-answer format.`;

    // Generate mock interview content using chatSession
    const result = await chatSession.sendMessage(inputPrompt);
    const responseText = await result.response.text();

    // Clean the response (remove code block formatting if present)
    const jsonMockResp = responseText.replace('```json', '').replace('```', '').trim();

    // Parse jsonMockResp as JSON
    let parsedMockResp;
    try {
      parsedMockResp = JSON.parse(jsonMockResp);
    } catch (parseError) {
      return new Response(JSON.stringify({ success: false, message: "Invalid JSON response from AI", error: parseError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate a unique mockId for tracking the interview
    const mockId = `mock_${Date.now()}`;

    // Create a new MockInterview document with the generated data
    const newMockInterview = new mockInterviewSchema({
      jsonMockResp: JSON.stringify(parsedMockResp), // Store as string, or as object if schema allows
      jobPosition,
      jobDesc,
      jobExperience,
      createdBy,
      mockId,
    });

    // Save the new document to MongoDB
    await newMockInterview.save();

    // Send a successful response back to the client
    return new Response(JSON.stringify({ success: true, data: newMockInterview }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error saving mock interview:", error);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
