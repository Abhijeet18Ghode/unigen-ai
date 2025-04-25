"use client";

import { WebcamIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import Link from 'next/link';

function InterviewDetails({ params }) {
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  
  useEffect(() => {
    const fetchInterviewDetails = async () => {
      if (!params?.interviewId) {
        console.error("Interview ID is missing from params.");
        return;
      }
      
      try {
        const response = await fetch(`/api/getinterviewdetails/${params.interviewId}`);
        const data = await response.json();
        
        if (data.success) {
          setInterviewDetails(data.data);
          console.log("Interview Details:", data.data);
        } else {
          console.error("Error fetching interview details:", data.message);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    
    fetchInterviewDetails();
  }, [params?.interviewId]);
  
  const handleStartInterview = () => {
    setWebcamEnabled(true);
  };

  return (
    <div className="my-10 flex justify-center flex-col items-center">
      <h1 className="font-bold text-2xl">Let's start Interview</h1>
      
      <div className="mt-6">
        {webcamEnabled ? (
          <Webcam
            audio={false}
            onUserMedia={() => console.log("Webcam connected")}
            onUserMediaError={(error) => {
              console.error("Webcam error:", error);
              setWebcamEnabled(false);
            }}
            mirrored={true}
            className="rounded-lg border"
            width={400}
            height={300}
          />
        ) : (
          <div className="flex flex-col items-center">
            <WebcamIcon className="h-72 w-72 p-20 bg-secondary rounded-lg border mb-4" />
            <button 
              onClick={handleStartInterview}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Interview
            </button>
          </div>
        )}
      </div>
      
      {interviewDetails ? (
        <div className="flex flex-col my-6 max-w-md">
          <h2 className="text-lg my-1"><strong>Job Position:</strong> {interviewDetails.jobPosition}</h2>
          <h2 className="text-lg my-1"><strong>Description:</strong> {interviewDetails.jobDesc}</h2>
          <h2 className="text-lg my-1"><strong>Experience:</strong> {interviewDetails.jobExperience} years</h2>
          <h2 className="text-lg my-1"><strong>Created By:</strong> {interviewDetails.createdBy}</h2>
        </div>

     
      ) : (
        <p className="mt-4">Loading interview details...</p>
      )}

          <div>
          <Link href={'/dashboard/interview/'+params.interviewId+'/start'}>
          <button >Start Interview</button>
          </Link>
          </div>
    </div>
  );
}

export default InterviewDetails;