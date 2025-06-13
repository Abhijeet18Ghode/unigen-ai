"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from 'lucide-react';

function InterviewResults({ params }) {
  const [interviewData, setInterviewData] = useState({
  interviewDetails: {},
  questions: [],
  answers: [],
  feedback: [],
  completedAt: null
});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add this at the beginning of your component
const [questions, setQuestions] = useState([]);
const [answers, setAnswers] = useState([]);
const [feedback, setFeedback] = useState([]);
const [interviewDetails, setInterviewDetails] = useState({});
const [completedAt, setCompletedAt] = useState('');

  // Fetch interview results data
useEffect(() => {
  const fetchInterviewResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/getinterviewresults/${params.interviewId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch interview results');
      }

      const { data } = await response.json();
      
      // Set individual state pieces
      setQuestions(data.questions || []);
      setAnswers(data.answers || []);
      setFeedback(data.feedback || []);
      setInterviewDetails(data.interviewDetails || {});
      setCompletedAt(data.completedAt || new Date().toISOString());
      
    } catch (err) {
      console.error('Error fetching interview results:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchInterviewResults();
}, [params.interviewId]);

// Update your render logic to use the individual state pieces
// const overallRating = feedback.length > 0 
//   ? feedback.reduce((sum, item) => sum + (item?.rating || 0), 0) / feedback.length
//   : 0;

if (loading) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

  if (error) {
    return (
      <div className="my-10 flex justify-center flex-col items-center max-w-2xl mx-auto p-6">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 w-full mb-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Results</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors">
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="my-10 flex justify-center flex-col items-center max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 w-full mb-6">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">No Results Found</h2>
          <p className="text-yellow-600 mb-4">We couldn't find results for this interview.</p>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors">
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate overall rating
  const overallRating = interviewData.feedback.reduce(
    (sum, item) => sum + (item?.rating || 0), 0
  ) / interviewData.feedback.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header section */}
          <div className="bg-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Interview Results</h1>
            <p className="text-blue-100">{interviewData.interviewDetails.jobPosition}</p>
          </div>

          {/* Summary section */}
          <div className="px-6 py-4 border-b">
            <div className="flex flex-wrap items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-lg font-semibold">Performance Summary</h2>
                <p className="text-gray-600">
                  Completed on {new Date(interviewData.completedAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">
                  {overallRating.toFixed(1)}/5
                </div>
                <div className="text-sm text-gray-600">Overall Rating</div>
              </div>
            </div>
          </div>

          {/* Detailed results */}
          <div className="divide-y divide-gray-200">
            {interviewData.questions.map((question, index) => {
              const answer = interviewData.answers[index] || 'No answer provided';
              const feedback = interviewData.feedback[index] || {};
              
              return (
                <div key={index} className="p-6">
                  <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{question}</h3>
                      
                      <div className="mt-2 bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700">Your Answer:</h4>
                        <p className="mt-1 text-gray-600 whitespace-pre-line">{answer}</p>
                      </div>

                      {feedback.rating && (
                        <div className="mt-4 bg-blue-50 p-4 rounded-md">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-blue-700">Feedback:</h4>
                            <div className="flex items-center">
                              <span className="mr-2 text-sm font-medium">
                                {feedback.rating}/5
                              </span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-2">
                            {feedback.feedback && (
                              <div>
                                <span className="text-sm font-medium">Evaluation:</span>
                                <p className="text-sm text-gray-600">{feedback.feedback}</p>
                              </div>
                            )}
                            
                            {feedback.suggestions && (
                              <div>
                                <span className="text-sm font-medium">Suggestions:</span>
                                <p className="text-sm text-gray-600">{feedback.suggestions}</p>
                              </div>
                            )}
                            
                            {feedback.alternatives && (
                              <div>
                                <span className="text-sm font-medium">Alternative Approaches:</span>
                                <p className="text-sm text-gray-600">{feedback.alternatives}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendations section */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <h2 className="text-lg font-semibold mb-3">Recommendations for Improvement</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {interviewData.feedback.some(f => f?.suggestions) && (
                <>
                  {interviewData.feedback
                    .filter(f => f?.suggestions)
                    .map((f, i) => (
                      <li key={i} className="text-sm">{f.suggestions}</li>
                    ))
                  }
                </>
              )}
              <li className="text-sm">Practice answering common interview questions for your industry</li>
              <li className="text-sm">Review the job description and align your answers with required skills</li>
              <li className="text-sm">Consider doing mock interviews to build confidence</li>
            </ul>
          </div>

          {/* Actions section */}
          <div className="bg-white px-6 py-4 flex justify-end">
            <Link href="/dashboard">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors mr-3">
                Return to Dashboard
              </button>
            </Link>
            <Link href={`/dashboard/interview/${params.interviewId}/analysis`}>
              <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
                Detailed Analysis
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewResults;