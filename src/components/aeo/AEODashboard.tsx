"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAEOApplication from "@/hooks/useAEOApplication";
import useAEOProfile from "@/hooks/useAeoProfile";
import Loader from "@/components/ui-utils/Loader";
import { toast } from "react-toastify";

interface AEOStats {
  Accredited: number;
  PCACompliant: number;
  RiskCompliant: number;
  Submitted: number;
  UnderReview: number;
  TotalApplications: number;
}

interface RecentApplication {
  id: number;
  status: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  applicationDate: string;
  approvalDate: string | null;
  expiryDate: string | null;
  attachments: any[];
  declarations: any[];
  company: {
    id: number;
    tin: string;
    tradingName: string;
    address: string;
    email: string;
    phonenumber: string;
    otp: string | null;
    deleted: boolean;
  };
}

interface ProfileCompletion {
  completionPercent: number;
  isComplete: boolean;
  missingSections: string[];
}

export default function AEODashboard() {
  const router = useRouter();
  const { getAEOApplicationStats, getRecentAEOApplications } = useAEOApplication();
  const { checkCompletion } = useAEOProfile();

  const [stats, setStats] = useState<AEOStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [statsResponse, recentResponse, profileResponse] = await Promise.all([
          getAEOApplicationStats(),
          getRecentAEOApplications(),
          checkCompletion()
        ]);

        setStats(statsResponse.data);
        setRecentApplications(recentResponse.data);
        setProfileCompletion(profileResponse.data);
      } catch (err: any) {
        console.error(err);
        const msg = err?.message || "Failed to load dashboard data";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [getAEOApplicationStats, getRecentAEOApplications, checkCompletion]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accredited':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'aeocompliant':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pcacompliant':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'query':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'riskcompliant':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'underreview':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center justify-center py-8">
          <Loader />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
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

  return (
    <div className="space-y-6">


      {/* Stats Cards */}
      {stats && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Application Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Submitted</p>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{stats.Submitted}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Accredited</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-200">{stats.Accredited}</p>
                </div>
              </div>
            </div>


            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Under Review</p>
                  <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{stats.UnderReview}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{stats.TotalApplications}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Status */}
      {profileCompletion && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Company Profile Status</h2>
            {!profileCompletion.isComplete && (
              <button
                onClick={() => router.push('/aeo/profile')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Complete Profile
              </button>
            )}
          </div>

          {profileCompletion.isComplete ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Profile Complete!
                  </h3>
                  <p className="text-green-600 dark:text-green-300 mt-1">
                    Your company profile is 100% complete. You can now apply for AEO licenses.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => router.push('/aeo/apply-licence')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Apply for AEO License
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6 flex-1">
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    Profile Incomplete
                  </h3>
                  <p className="text-amber-600 dark:text-amber-300 mt-1">
                    Your company profile is {profileCompletion.completionPercent}% complete. Please complete the missing sections to apply for AEO licenses.
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
      )}

      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Applications</h2>
            <button
              onClick={() => router.push('/aeo/applications')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => router.push(`/aeo/application/${app.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">#{app.id}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{app.company.tradingName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Applied on {formatDate(app.applicationDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
