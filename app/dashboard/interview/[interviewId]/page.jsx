"use client";
import { WebcamIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import Link from 'next/link';

function InterviewDetails({ params }) {
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [webcamEnabled, setwebcamEnabled] = useState(false)

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
          console.log("Interview Details:", data.data);  // Log the fetched details
        } else {
          console.error("Error fetching interview details:", data.message);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchInterviewDetails();
  }, [params.interviewId]);

  return (
    <div className="my-10 flex justify-center flex-col items-center">
      <h1 className='font-bold text-2xl'>Let's start Interview</h1>

      <div className=''></div>
      <div className="g">
        {
          webcamEnabled? <Webcam
          onUserMedia={()=>{setwebcamEnabled(true)}}
          onUserMediaError={()=>{setwebcamEnabled(false)}}
          mirrored={true}
          style={
            {
              height:300,
              width:300
            }
          }
          /> 
          :<>
          <WebcamIcon className='h-72 w-72 p-20 bg-secondary rounded-lg border'/>
          <Link href={`/dashboard/interview/${params.interviewId}/start`}><button onClick={() => { setwebcamEnabled(true); }}>start</button>
          </Link>
          </>

        }
      </div>
      {interviewDetails ? (
        <div className='flex flex-col my-6'>
          <h2 className='text-lg'><strong>Job Position:</strong> {interviewDetails.jobPosition}</h2>
          <h2 className='text-lg'><strong>Description:</strong> {interviewDetails.jobDesc}</h2>
          <h2 className='text-lg'><strong>Experience:</strong> {interviewDetails.jobExperience} years</h2>
          <h2 className='text-lg'><strong>Created By:</strong> {interviewDetails.createdBy}</h2>
          {/* Render more fields if needed */}
        </div>
      ) : (
        <p>Loading...</p>
      )}

    </div>
  );
}

export default InterviewDetails;
