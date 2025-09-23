"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAEOProfile from "@/hooks/useAeoProfile";
import ApplyAEOLicence from "./ApplyAEOLicence";
import Loader from "@/components/ui-utils/Loader";

interface ProfileCompletion {
  completionPercent: number;
  isComplete: boolean;
  missingSections: string[];
}

export default function ApplyAEOLicenceWrapper() {
  const router = useRouter();
  const { checkCompletion } = useAEOProfile();
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProfileCompletion = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await checkCompletion();
        setProfileCompletion(response.data);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load profile completion status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileCompletion();
  }, [checkCompletion]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Checking profile status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileCompletion) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <p className="text-gray-500 dark:text-gray-400">Unable to load profile status.</p>
      </div>
    );
  }

  if (!profileCompletion.isComplete) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-8 border border-amber-200 dark:border-amber-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            Profile Incomplete
          </h2>
          
          <p className="text-amber-600 dark:text-amber-300 mb-6 max-w-md mx-auto">
            Your company profile is {profileCompletion.completionPercent}% complete. You must complete your profile before applying for AEO licenses.
          </p>
          
          {/* Progress Bar */}
          <div className="mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-amber-700 dark:text-amber-300 mb-2">
              <span>Completion Progress</span>
              <span>{profileCompletion.completionPercent}%</span>
            </div>
            <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-3">
              <div 
                className="bg-amber-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${profileCompletion.completionPercent}%` }}
              ></div>
            </div>
          </div>
          
          {/* Missing Sections */}
          {profileCompletion.missingSections.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-3">
                Missing Sections:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {profileCompletion.missingSections.map((section, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/aeo/profile')}
              className="w-full max-w-xs mx-auto px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              Complete Profile
            </button>
            
            <button
              onClick={() => router.push('/aeo')}
              className="w-full max-w-xs mx-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile is complete, show the application form
  return <ApplyAEOLicence />;
}

