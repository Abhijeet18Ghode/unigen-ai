import mongooseConnection from '../../../../lib/mongoose';
import mockInterviewSchema from '../../../../model/mockInterview';

export async function GET(req, { params }) {
  try {
    // Connect to MongoDB
    await mongooseConnection();

    // Extract `id` from the request parameters
    const { id } = params;

    // Fetch the interview by ID
    const interview = await mockInterviewSchema.findById(id);

    // Check if interview exists
    if (!interview) {
      return new Response(JSON.stringify({ success: false, message: "Interview not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send the interview data as a response
    return new Response(JSON.stringify({ success: true, data: interview }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
