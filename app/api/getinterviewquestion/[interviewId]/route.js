import { NextResponse } from 'next/server';

import MockInterview from '../../../../model/mockInterview';
import mongoose from 'mongoose';
import mongooseConnection from '../../../../lib/mongoose';

export async function GET(request, { params }) {
  try {
    const { interviewId } = params;
    
    if (!interviewId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Interview ID is required' 
      }, { status: 400 });
    }

    await mongooseConnection();
    
    // Find the interview by _id or mockId depending on the format of interviewId
    let interview;
    if (mongoose.Types.ObjectId.isValid(interviewId)) {
      interview = await MockInterview.findById(interviewId);
    } else {
      interview = await MockInterview.findOne({ mockId: interviewId });
    }
    
    if (!interview) {
      return NextResponse.json({ 
        success: false, 
        message: 'Interview not found' 
      }, { status: 404 });
    }
    
    try {
      // Parse the stored JSON string of questions
      const questions = JSON.parse(interview.jsonMockResp);
      
      return NextResponse.json({
        success: true,
        data: questions
      });
    } catch (jsonError) {
      console.error('Error parsing interview questions JSON:', jsonError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error parsing interview questions' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error fetching interview questions:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching interview questions' 
    }, { status: 500 });
  }
}
