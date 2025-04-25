// File: app/api/submitinterview/route.js
import { NextResponse } from 'next/server';

import mongoose from 'mongoose';
import mongooseConnection from '../../../lib/mongoose';

// Create a submissions schema since it's not provided
const interviewSubmissionSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockInterview',
    required: true
  },
  mockId: String,
  answers: Array,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Check if model exists before creating
let InterviewSubmission;
try {
  InterviewSubmission = mongoose.model('InterviewSubmission');
} catch (error) {
  InterviewSubmission = mongoose.model('InterviewSubmission', interviewSubmissionSchema);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { interviewId, answers } = body;
    
    if (!interviewId || !answers) {
      return NextResponse.json({ 
        success: false, 
        message: 'Interview ID and answers are required' 
      }, { status: 400 });
    }

    await mongooseConnection();
    
    // Find the original interview to get the mockId
    let mockId = null;
    if (mongoose.Types.ObjectId.isValid(interviewId)) {
      const MockInterview = mongoose.model('MockInterview');
      const interview = await MockInterview.findById(interviewId);
      if (interview) {
        mockId = interview.mockId;
      }
    } else {
      mockId = interviewId; // If interviewId is already a mockId
    }
    
    // Create a new submission record
    const submission = new InterviewSubmission({
      interviewId: mongoose.Types.ObjectId.isValid(interviewId) ? interviewId : null,
      mockId: mockId,
      answers,
      submittedAt: new Date()
    });
    
    const savedSubmission = await submission.save();
    
    return NextResponse.json({
      success: true,
      message: 'Interview submitted successfully',
      submissionId: savedSubmission._id
    });
    
  } catch (error) {
    console.error('Error submitting interview:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error submitting interview' 
    }, { status: 500 });
  }
}
