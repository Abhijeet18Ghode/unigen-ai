"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "../../../utils/geminiAi";
import { LoaderPinwheel } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [opendialogue, setopendialogue] = useState(false);
  const [jobPosition, setjobPosition] = useState("");
  const [jobDescription, setjobDescription] = useState("");
  const [jobExperience, setjobExperience] = useState("");
  const [loading, setloading] = useState(false);
  const [jsonResponse, setjsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter()

  const onSubmit = async (e) => {
    e.preventDefault();
    setloading(true);
  
    const createdBy = user?.emailAddresses?.[0]?.emailAddress || "unknown";  // Ensure `createdBy` has a value
  
    try {
      const response = await fetch("/api/addInterview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobPosition,
          jobDesc: jobDescription,
          jobExperience,
          createdBy,
        }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        console.log("Interview saved:", result.data);
        console.log("Interview ID:", result.data._id); // Log the specific _id
        setopendialogue(false);
        setjobPosition("");
        setjobDescription("");
        setjobExperience("");
        // Redirect using the _id
      router.push(`/dashboard/interview/${result.data._id}`);
       
      } else {
        console.error("Error:", result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setloading(false);
    }
  };
  

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md transition-all"
        onClick={() => setopendialogue(true)}
      >
        <h2 className="font-bold text-lg text-center cursor-pointer">+ Add New</h2>
      </div>
      <Dialog open={opendialogue} onClose={() => setopendialogue(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job interviewing 
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>Add details about your job role</h2>
                  <div className="mt-7 my-3">
                    <label>Job role</label>
                    <Input
                      placeholder="Ex. Full stack developer"
                      value={jobPosition}
                      required
                      onChange={(event) => setjobPosition(event.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label>Job Description/ Tech stack (In Short)</label>
                    <Textarea
                      placeholder="Ex. React, Angular etc."
                      value={jobDescription}
                      required
                      onChange={(event) => setjobDescription(event.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label>Years of experience</label>
                    <Input
                      type="number"
                      placeholder="Ex. 5"
                      value={jobExperience}
                      required
                      onChange={(event) => setjobExperience(event.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setopendialogue(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <LoaderPinwheel className="animate-spin" />
                        Generating from AI
                      </div>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
