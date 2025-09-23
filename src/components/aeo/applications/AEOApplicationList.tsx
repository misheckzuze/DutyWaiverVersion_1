"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AEOApplicationsTable, AEOApplication } from "./AEOApplicationsTable";
import useAEOApplication from "@/hooks/useAEOApplication";
import Loader from "@/components/ui-utils/Loader";
import EnhancedConfirmationDialog from "@/components/ui-utils/EnhancedConfirmationDialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AEOApplicationList: React.FC = () => {
  const router = useRouter();
  const { getAllAEOApplications } = useAEOApplication();

  const [apps, setApps] = useState<AEOApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmType, setConfirmType] =
    useState<"success" | "warning" | "danger" | "info">("warning");

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      setError("");
      try {
        const resp = await getAllAEOApplications(); // expects { success, data }
        const data: AEOApplication[] = Array.isArray(resp?.data) ? resp.data : [];
        setApps(data);
        toast.success("AEO applications loaded successfully");
      } catch (err: any) {
        console.error(err);
        const msg = err?.message || "Failed to load AEO applications";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [getAllAEOApplications]);

  const refresh = async () => {
    try {
      const resp = await getAllAEOApplications();
      const data: AEOApplication[] = Array.isArray(resp?.data) ? resp.data : [];
      setApps(data);
    } catch {
      /* error toast already handled above */
    }
  };

  const handleUpdate = (id: string) => {
    setSelectedApplicationId(id);
    setConfirmMessage("Are you sure you want to update this application?");
    setConfirmType("info");
    setConfirmAction(() => () => {
      router.push(`/aeo/application/${id}/edit`);
      toast.info("Updating application...");
    });
    setShowConfirmDialog(true);
  };

  const handleRespondToQuery = (id: string) => {
    setSelectedApplicationId(id);
    setConfirmMessage("Are you sure you want to respond to this query?");
    setConfirmType("info");
    setConfirmAction(() => () => {
      router.push(`/aeo/application/${id}/respond`);
      toast.info("Responding to query...");
    });
    setShowConfirmDialog(true);
  };

  const handleView = (id: string) => {
    router.push(`/aeo/application/${id}`);
    toast.info("Loading application details...");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              My AEO Applications
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track and manage your AEO license applications
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {apps.length} Total Applications
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : (
        <>
          <AEOApplicationsTable
            applications={apps}
            onUpdate={handleUpdate}
            onRespondToQuery={handleRespondToQuery}
            onView={handleView}
          />

          <EnhancedConfirmationDialog
            isOpen={showConfirmDialog}
            message={confirmMessage}
            onConfirm={() => {
              confirmAction();
              setShowConfirmDialog(false);
            }}
            onCancel={() => setShowConfirmDialog(false)}
            type={confirmType}
          />
        </>
      )}
    </div>
  );
};

export default AEOApplicationList;
