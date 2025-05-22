import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ViewApplication from "@/components/duty-waiver/application-form/view-application/ViewApplication";

export const metadata: Metadata = {
  title: "View Duty Waiver Application | Duty Waiver System",
  description: "View your duty waiver application details.",
  keywords: "Duty Waiver, View Application",
};

interface ViewApplicationPageProps {
  params: {
    id: string;
  };
}

export default function ViewApplicationPage({ params }: ViewApplicationPageProps) {
  if (!params?.id) {
    notFound();
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Application #${params.id}`} />
      
      <div className="px-6">
        <ViewApplication id={params.id} />
      </div>
    </div>
  );
}
