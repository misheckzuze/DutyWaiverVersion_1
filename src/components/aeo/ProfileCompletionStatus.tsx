"use client";
import React, { useEffect, useState } from "react";
import useAEOProfile from "@/hooks/useAeoProfile";
import Loader from "@/components/ui-utils/Loader";

interface ProfileCompletion {
  completionPercent: number;
  isComplete: boolean;
  missingSections: string[];
}

export default function ProfileCompletionStatus() {
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
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex items-center justify-center py-4">
          <Loader />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading profile status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileCompletion) return null;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Profile Completion Status</h2>
      
      {profileCompletion.isComplete ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Profile Complete!
              </h3>
              <p className="text-green-600 dark:text-green-300">
                Your company profile is 100% complete. You can now apply for AEO licenses.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                Profile Incomplete
              </h3>
              <p className="text-amber-600 dark:text-amber-300">
                Your company profile is {profileCompletion.completionPercent}% complete. Please complete the missing sections below.
              </p>
              
              {/* Progress Bar */}
              <div className="mt-4">
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
                <div className="mt-4">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
                    Missing Sections:
                  </p>
                  <div className="flex flex-wrap gap-2">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

