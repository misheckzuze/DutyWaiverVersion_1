import React from 'react';
import ApplyAEOLicenceWrapper from '@/components/aeo/ApplyAEOLicenceWrapper';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Apply AEO Licence" />
      <div className="px-6 py-6">
        <ApplyAEOLicenceWrapper />
      </div>
    </div>
  );
}
