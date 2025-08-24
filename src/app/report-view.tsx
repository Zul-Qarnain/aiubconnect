'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';

export function ReportView() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  if (view === 'sent') {
    return (
      <p className="mt-4 text-green-500">
        Your report has been sent. Thank you for your feedback.
      </p>
    );
  }
  return null;
}