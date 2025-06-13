import mongoose from 'mongoose';
import MockInterview from './mockInterview'; // Adjust the import path as necessary

const answerSchema = new mongoose.Schema({
  questionId: String,
  questionText: String,
  userAnswer: String,
  isCorrect: Boolean,
  feedback: String,
  score: Number,
  rating: Number,
  suggestions: String,
  alternatives: String
});

const interviewSubmissionSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockInterview'
  },
  mockId: String,
  answers: [answerSchema],
  overallFeedback: String,
  totalScore: Number,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  evaluatedAt: Date
});

// Check if model exists before creating
export default mongoose.models.InterviewSubmission || 
       mongoose.model('InterviewSubmission', interviewSubmissionSchema);