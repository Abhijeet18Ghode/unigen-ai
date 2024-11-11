'use client'
import React, { useEffect, useState } from 'react'

function startInterview({params}) {
    const [interviewDetails, setInterviewDetails] = useState();
    const [mockInterviewQuestions, setmockInterviewQuestions] = useState()
    useEffect(() => {
        const fetchInterviewDetails = async () => {
          if (!params?.interviewId) {
            console.error("Interview ID is missing from params.");
            return;
          }
    
          try {
            const response = await fetch(`/api/getinterviewdetails/${params.interviewId}`);
            const data = await response.json();

            const jsonmockresp = JSON.parse(data.jsonMockResp)
    
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
    <div>startInterview</div>
  )
}

export default startInterview