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

  const handleEdit = (id: string) => {
    setSelectedApplicationId(id);
    setConfirmMessage("Are you sure you want to edit this application?");
    setConfirmType("info");
    setConfirmAction(() => () => {
      router.push(`/edit-application/${id}`);
      toast.info("Editing application...");
    });
    setShowConfirmDialog(true);
  };

  const handleCancel = (id: string) => {
    setSelectedApplicationId(id);
    setConfirmMessage(
      "Are you sure you want to cancel this application? This action cannot be undone."
    );
    setConfirmType("danger");
    setConfirmAction(() => () => {
      // TODO: call cancel endpoint when ready
      toast.success("Application cancelled successfully");
      refresh();
    });
    setShowConfirmDialog(true);
  };

  const handleView = (id: string) => {
    router.push(`/view-application/${id}`);
    toast.info("Loading application details...");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My AEO Applications</h1>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <AEOApplicationsTable
            applications={apps}
            onSubmit={handleEdit}
            onCancel={handleCancel}
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
