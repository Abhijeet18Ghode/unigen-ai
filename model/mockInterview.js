import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema({
  jsonMockResp: String,
  jobPosition: String,
  jobDesc: String,
  jobExperience: String,
  createdBy: String,
  mockId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model is already registered
export default mongoose.models.MockInterview || mongoose.model('MockInterview', mockInterviewSchema);

