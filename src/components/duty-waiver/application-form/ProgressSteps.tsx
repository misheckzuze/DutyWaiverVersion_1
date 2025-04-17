"use client";
import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep, totalSteps }) => {
  const stepLabels = [
    'Project Details',
    'Items',
    'Attachments',
    'Review'
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {stepLabels.map((label, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${currentStep >= index + 1 ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= index + 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {index + 1}
            </div>
            <span className="text-xs mt-1">{label}</span>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};