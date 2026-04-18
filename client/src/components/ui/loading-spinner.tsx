import React from 'react';

export function LoadingSpinner({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const sizeClass = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-3",
    large: "h-12 w-12 border-4"
  };

  return (
    <div className="w-full flex justify-center items-center py-6">
      <div className={`${sizeClass[size]} animate-spin rounded-full border-b-transparent border-primary`}></div>
    </div>
  );
}