"use client";

import React, { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { ChevronRightIcon, MicIcon, PauseIcon, PlayIcon, SquareIcon } from 'lucide-react';
import Link from 'next/link';
import { ChatSession } from '@google/generative-ai';

function InterviewStart({ params }) {
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [interviewInProgress, setInterviewInProgress] = useState(false);
  
  const webcamRef = useRef(null);
  const timerRef = useRef(null);

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
  };

  const startRecording = () => {
    setIsRecording(true);
    // Start timer
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);

    // In a real application, here you would:
    // 1. Stop recording the audio/video
    // 2. Process and save the recording
    // 3. Optionally implement speech-to-text for the answer
    
    // For this demo, we'll simulate saving an answer
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = `Answer recorded (${formatTime(recordingTime)})`;
    setAnswers(updatedAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Interview completed
      setInterviewCompleted(true);
    }
    
    // Stop recording if it's still going
    if (isRecording) {
      stopRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // const feedbackprompt = "Question:"+questions[0]+'user answer'+answers[0]+'depends on the questions and answer for given interview give the feedback and rating if any in just 3-5 lines to improve it and in json format with rating field and feedback field';

  // const result = ChatSession.sendMessage(feedbackprompt);
  // const mockjsonresponse= (result.response.text()).replace('```json,').replace('```',);
  //   console.log(mockjsonresponse)
    

  const submitInterview = async () => {
    try {
      // Here you would send the recorded answers to your API
      const response = await fetch('/api/submitinterview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: params.interviewId,
          answers: answers,
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
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Submit Interview
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
          
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <h3 className="font-medium mb-2">Your Answer:</h3>
            <p>{answers[currentQuestion] || "No answer recorded yet"}</p>
          </div>
          
          <div className="flex justify-between items-center">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={isRecording}
              >
                <MicIcon className="h-5 w-5 mr-2" /> Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <SquareIcon className="h-5 w-5 mr-2" /> Stop Recording {formatTime(recordingTime)}
              </button>
            )}
            
            <button
              onClick={nextQuestion}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Interview'} <ChevronRightIcon className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col">
          <Webcam
            audio={true}
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
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewStart;