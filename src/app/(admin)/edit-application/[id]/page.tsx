'use client';
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import EditApplicationForm from "@/components/duty-waiver/application-form/edit-applications/EditApplication";

export const metadata: Metadata = {
  title: "Edit Duty Waiver Application | Duty Waiver System",
  description: "Edit your duty waiver application.",
  keywords: "Duty Waiver, Edit Application",
};

interface EditApplicationPageProps {
  params: {
    id: string;
  };
}

export default function EditApplicationPage({ params }: EditApplicationPageProps) {
  if (!params?.id) {
    notFound();
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit Application #${params.id}`} />
      
      <div className="px-6">
        <EditApplicationForm id={params.id} />
      </div>
    </div>
  );
}
