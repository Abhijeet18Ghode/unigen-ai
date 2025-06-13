"use client";

import React, { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { ChevronRightIcon, MicIcon, PauseIcon, PlayIcon, SquareIcon } from 'lucide-react';
import Link from 'next/link';
import { GoogleGenerativeAI } from '@google/generative-ai';

function InterviewStart({ params })  {
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [interviewInProgress, setInterviewInProgress] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [chatSession, setChatSession] = useState(null);
  
  const webcamRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const genAI = useRef(null);

  // Initialize Google Generative AI
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      genAI.current = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
      const model = genAI.current.getGenerativeModel({ model: "gemini-pro" });
      setChatSession(model.startChat());
    } else {
      console.warn("Google API key not found. Feedback generation will be disabled.");
    }
  }, []);

  // Check for speech recognition support
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSpeechRecognitionSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (!isSpeechRecognitionSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(prev => {
        // Remove previous interim results and add new ones
        const base = prev.replace(/\[.*\]/, '').trim();
        return `${base} ${finalTranscript}`.trim() + (interimTranscript ? ` [${interimTranscript}]` : '');
      });
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        // Restart recognition if we're still recording
        recognitionRef.current.start();
      }
    };
  };

  // Initialize audio recording
  const initializeAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        // Here you could upload the audio blob to your server if needed
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('Audio recording saved', audioBlob);
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error initializing audio recording:', error);
    }
  };

  // Generate feedback for the current answer
  const generateFeedback = async (question, answer) => {
    if (!chatSession || !answer || answer === 'No answer recorded') {
      console.log('Skipping feedback generation for empty answer');
      return null;
    }

    try {
      const feedbackprompt = `
        You are an expert interview coach. Please provide feedback on this interview response.
        Question: ${question}
        Answer: ${answer}
        
        Please provide:
        1. A rating from 1-5 (5 being best)
        2. Specific feedback on what was good
        3. Specific suggestions for improvement
        4. Alternative ways to answer if applicable
        
        Format your response as JSON with these fields:
        - rating (number)
        - feedback (string)
        - suggestions (string)
        - alternatives (string, optional)
      `;

      const result = await chatSession.sendMessage(feedbackprompt);
      const responseText = result.response.text();
      
      // Clean up the response to extract JSON
      let jsonResponse;
      try {
        // Try to parse directly first
        jsonResponse = JSON.parse(responseText);
      } catch (e) {
        // If that fails, try to extract JSON from markdown
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[1]);
        } else {
          // Fallback to using the raw text as feedback
          jsonResponse = {
            rating: 0,
            feedback: "Could not parse feedback",
            suggestions: responseText
          };
        }
      }

      console.log('Generated feedback:', jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.error('Error generating feedback:', error);
      return {
        rating: 0,
        feedback: "Error generating feedback",
        suggestions: "Please try again later"
      };
    }
  };

  // Fetch interview details and questions
  useEffect(() => {
    const fetchInterviewData = async () => {
      if (!params?.interviewId) {
        console.error("Interview ID is missing from params.");
        return;
      }
      
      try {
        // Fetch interview details
        const detailsResponse = await fetch(`/api/getinterviewdetails/${params.interviewId}`);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.success) {
          setInterviewDetails(detailsData.data);
          
          // Fetch interview questions
          const questionsResponse = await fetch(`/api/getinterviewquestion/${params.interviewId}`);
          const questionsData = await questionsResponse.json();
          
          if (questionsData.success) {
            setQuestions(questionsData.data);
            // Initialize answers array with empty strings
            setAnswers(new Array(questionsData.data.length).fill(''));
            // Initialize feedback array
            setFeedback(new Array(questionsData.data.length).fill(null));
          } else {
            console.error("Error fetching interview questions:", questionsData.message);
          }
        } else {
          console.error("Error fetching interview details:", detailsData.message);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    
    fetchInterviewData();
  }, [params?.interviewId]);

  const startInterview = () => {
    setInterviewInProgress(true);
    initializeSpeechRecognition();
  };

  const startRecording = () => {
    if (!isSpeechRecognitionSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    setIsRecording(true);
    setTranscript('');
    
    // Start timer
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    // Start speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
    
    // Start audio recording
    initializeAudioRecording();
  };

  const stopRecording = async () => {
    setIsProcessing(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Stop audio recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Clean up the transcript (remove any interim results)
    const finalTranscript = transcript.replace(/\[.*\]/, '').trim();
    setTranscript(finalTranscript);
    
    // Update answers with the final transcript
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = finalTranscript || 'No answer recorded';
    setAnswers(updatedAnswers);
    
    // Generate feedback for this answer
    if (chatSession && finalTranscript) {
      const currentFeedback = await generateFeedback(
        questions[currentQuestion]?.question || "Unknown question",
        finalTranscript
      );
      
      if (currentFeedback) {
        const updatedFeedback = [...feedback];
        updatedFeedback[currentQuestion] = currentFeedback;
        setFeedback(updatedFeedback);
      }
    }
    
    setIsRecording(false);
    setIsProcessing(false);
  };

  const nextQuestion = async () => {
    // If currently recording, stop first
    if (isRecording) {
      await stopRecording();
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTranscript(''); // Reset transcript for new question
    } else {
      // Interview completed
      setInterviewCompleted(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const submitInterview = async () => {
    try {
      setIsProcessing(true);
      
      // Here you would send the recorded answers to your API
      const response = await fetch('/api/submitinterview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: params.interviewId,
          answers: answers,
          feedback: feedback // Include feedback in the submission
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Redirect to results or thank you page
        window.location.href = `/dashboard/interview/${params.interviewId}/results`;
      } else {
        console.error("Error submitting interview:", data.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!interviewDetails || questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!interviewInProgress) {
    return (
      <div className="my-10 flex justify-center flex-col items-center max-w-2xl mx-auto p-6">
        <h1 className="font-bold text-2xl mb-6">Ready to Start Your Interview</h1>
        
        <div className="bg-gray-50 p-6 rounded-lg border w-full mb-6">
          <h2 className="text-xl font-semibold mb-4">Interview Information</h2>
          <p className="mb-2"><strong>Position:</strong> {interviewDetails.jobPosition}</p>
          <p className="mb-2"><strong>Description:</strong> {interviewDetails.jobDesc}</p>
          <p className="mb-2"><strong>Experience Required:</strong> {interviewDetails.jobExperience} years</p>
          <p className="mb-4"><strong>Number of Questions:</strong> {questions.length}</p>
          
          <h3 className="text-lg font-medium mt-4 mb-2">Instructions:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ensure your webcam and microphone are working properly</li>
            <li>Find a quiet place with good lighting</li>
            <li>You'll have up to 3 minutes to answer each question</li>
            <li>Speak clearly and answer each question thoroughly</li>
            <li>You cannot go back to previous questions</li>
            {!isSpeechRecognitionSupported && (
              <li className="text-red-500">Note: Your browser doesn't support speech-to-text. You'll need to manually type your answers.</li>
            )}
          </ul>
        </div>
        
        <button
          onClick={startInterview}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Begin Interview
        </button>
      </div>
    );
  }

  if (interviewCompleted) {
    return (
      <div className="my-10 flex justify-center flex-col items-center max-w-2xl mx-auto p-6">
        <h1 className="font-bold text-2xl mb-6">Interview Completed</h1>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 w-full mb-6">
          <p className="text-green-700 mb-4">You have successfully completed all interview questions. Thank you for your participation!</p>
          
          <h2 className="text-lg font-semibold mb-2">Summary:</h2>
          <p className="mb-2"><strong>Position:</strong> {interviewDetails.jobPosition}</p>
          <p className="mb-2"><strong>Questions Answered:</strong> {questions.length}</p>
        </div>
        
        <button
          onClick={submitInterview}
          disabled={isProcessing}
          className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? 'Submitting...' : 'Submit Interview'}
        </button>
        
        <Link href="/dashboard">
          <button className="px-6 py-3 mt-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors">
            Return to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="my-10 flex justify-center flex-col items-center max-w-4xl mx-auto p-4">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl">Interview in Progress</h1>
        <div className="text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="flex flex-col">
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <h2 className="text-lg font-semibold mb-2">Current Question:</h2>
            <p className="text-lg">{questions[currentQuestion]?.question || "No question available"}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border mb-4 min-h-32">
            <h3 className="font-medium mb-2">Your Answer:</h3>
            {isRecording ? (
              <div className="space-y-2">
                <p className="text-gray-700">{transcript || 'Start speaking...'}</p>
                <div className="flex items-center text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                  <span>Recording in progress</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">
                {answers[currentQuestion] || "No answer recorded yet"}
              </p>
            )}
          </div>

          {/* Feedback section */}
          {feedback[currentQuestion] && !isRecording && (
            <div className="bg-blue-50 p-4 rounded-lg border mb-4">
              <h3 className="font-medium mb-2 text-blue-700">Feedback:</h3>
              <div className="flex items-center mb-2">
                <span className="font-semibold mr-2">Rating:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < feedback[currentQuestion].rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="mb-2"><span className="font-semibold">Feedback:</span> {feedback[currentQuestion].feedback}</p>
              <p className="mb-2"><span className="font-semibold">Suggestions:</span> {feedback[currentQuestion].suggestions}</p>
              {feedback[currentQuestion].alternatives && (
                <p><span className="font-semibold">Alternatives:</span> {feedback[currentQuestion].alternatives}</p>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className={`flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <MicIcon className="h-5 w-5 mr-2" /> 
                {isProcessing ? 'Processing...' : 'Start Recording'}
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <SquareIcon className="h-5 w-5 mr-2" /> 
                Stop Recording {formatTime(recordingTime)}
              </button>
            )}
            
            <button
              onClick={nextQuestion}
              disabled={isProcessing}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Interview'} 
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col">
          <Webcam
            audio={false} // We're handling audio separately
            ref={webcamRef}
            onUserMedia={() => console.log("Webcam connected")}
            onUserMediaError={(error) => console.error("Webcam error:", error)}
            mirrored={true}
            className="rounded-lg border w-full h-64 object-cover mb-4"
          />
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-medium mb-2">Interview Details:</h3>
            <p className="mb-1"><strong>Position:</strong> {interviewDetails.jobPosition}</p>
            <p className="mb-1"><strong>Experience Level:</strong> {interviewDetails.jobExperience} years</p>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Tips:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Speak clearly and maintain eye contact with the camera</li>
                <li>• Structure your answers using the STAR method when applicable</li>
                <li>• Take a moment to gather your thoughts before answering</li>
                {isRecording && (
                  <li className="text-green-600">• We're transcribing your answer in real-time</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewStart;