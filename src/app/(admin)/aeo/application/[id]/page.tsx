"use client";
import AEOApplicationDetails from '@/components/aeo/AEOApplicationDetails';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AEOApplicationDetailsPage({ params }: PageProps) {
  const applicationId = parseInt(params.id, 10);

  if (isNaN(applicationId)) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 dark:text-red-300">Invalid application ID</p>
          </div>
        </div>
      </div>
    );
  }

  return <AEOApplicationDetails applicationId={applicationId} />;
}
