import mongooseConnection from '../../../../lib/mongoose';
import MockInterview from '../../../../model/mockInterview';
import InterviewSubmission from '../../../../model/interviewSubmission';
import mongoose from 'mongoose';
// This API route fetches the results of a mock interview by its ID or mockId
export async function GET(req, { params }) {
  try {
    await mongooseConnection();
    
    const { id } = params;

    // Try to find by mockId first
    let interview = await MockInterview.findOne({ mockId: id });
    
    // If not found by mockId, try by _id
    if (!interview && mongoose.Types.ObjectId.isValid(id)) {
      interview = await MockInterview.findById(id);
    }

    if (!interview) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Interview not found" 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find submissions for this interview
    const submissions = await InterviewSubmission.find({
      $or: [
        { interviewId: interview._id },
        { mockId: interview.mockId }
      ]
    }).sort({ submittedAt: -1 }); // Get most recent first

    // Parse the interview questions
    let questions = [];
    let feedback = [];
    try {
      const parsedData = typeof interview.jsonMockResp === 'string' 
        ? JSON.parse(interview.jsonMockResp) 
        : interview.jsonMockResp;
      
      if (Array.isArray(parsedData)) {
        questions = parsedData.map(item => item.question);
        feedback = parsedData.map(item => ({
          rating: item.rating || 3, // Default rating if not provided
          feedback: item.feedback || 'No feedback provided',
          suggestions: item.suggestions || '',
          alternatives: item.alternatives || ''
        }));
      }
    } catch (e) {
      console.error("Error parsing interview data:", e);
    }

    // Get answers from the most recent submission
    const answers = submissions.length > 0 
      ? submissions[0].answers.map(a => a.userAnswer)
      : [];

    // Prepare response data in the format expected by frontend
    const responseData = {
      interviewDetails: {
        jobPosition: interview.jobPosition,
        jobDesc: interview.jobDesc,
        jobExperience: interview.jobExperience
      },
      questions,
      answers,
      feedback,
      completedAt: submissions.length > 0 
        ? submissions[0].submittedAt 
        : interview.createdAt
    };

    return new Response(JSON.stringify({ 
      success: true, 
      data: responseData 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error fetching interview results:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message || "Server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}