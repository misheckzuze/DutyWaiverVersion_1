"use client";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

type Declaration = {
  name: string;
  designation: string;
  place: string;
  signedDate: string;
  signatureImage?: string | null;
};

export default function DeclarationsField({ index = 0 }: { index?: number }) {
  const { control, register } = useFormContext();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Controller
          name={`declarations.${index}.name` as any}
          control={control}
          render={({ field }) => (
            <div>
              <label className="text-sm">Name</label>
              <input {...field} className="w-full border rounded p-2" />
            </div>
          )}
        />

        <Controller
          name={`declarations.${index}.designation` as any}
          control={control}
          render={({ field }) => (
            <div>
              <label className="text-sm">Designation</label>
              <input {...field} className="w-full border rounded p-2" />
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Controller
          name={`declarations.${index}.place` as any}
          control={control}
          render={({ field }) => (
            <div>
              <label className="text-sm">Place</label>
              <input {...field} className="w-full border rounded p-2" />
            </div>
          )}
        />

        <Controller
          name={`declarations.${index}.signedDate` as any}
          control={control}
          render={({ field }) => (
            <div>
              <label className="text-sm">Signed Date</label>
              <input type="date" {...field} className="w-full border rounded p-2" />
            </div>
          )}
        />
      </div>
    </div>
  );
}
