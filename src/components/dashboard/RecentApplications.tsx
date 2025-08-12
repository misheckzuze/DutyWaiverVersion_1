'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';
import useApplication from '@/hooks/useApplications';
import Loader from '../ui-utils/Loader';
import EnhancedConfirmationDialog from '@/components/ui-utils/EnhancedConfirmationDialog';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EyeIcon, PencilSquareIcon, ChevronDownIcon, ClockIcon, CheckCircleIcon, XCircleIcon, PaperPlaneIcon } from '@/icons';

// Sleek status styles (consistent with Applications table)
const statusStyles: Record<string, { class: string; icon: React.ReactNode }> = {
  draft: {
    class: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300',
    icon: <ClockIcon className="w-4 h-4 text-gray-600" />,
  },
  submitted: {
    class: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300',
    icon: <ClockIcon className="w-4 h-4 text-blue-600" />,
  },
  processing: {
    class: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300',
    icon: <ClockIcon className="w-4 h-4 text-yellow-600" />,
  },
  approved: {
    class: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300',
    icon: <CheckCircleIcon className="w-4 h-4 text-green-600" />,
  },
  rejected: {
    class: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300',
    icon: <XCircleIcon className="w-4 h-4 text-red-600" />,
  },
};

export default function RecentApplications() {
  const router = useRouter();
  const { getApplicationsByTIN, applications, isLoading, submitApplication } = useApplication();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected'>('all');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmType, setConfirmType] = useState<'success' | 'warning' | 'danger' | 'info'>('warning');
  const [onConfirmAction, setOnConfirmAction] = useState<() => Promise<void>>(async () => {});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getApplicationsByTIN();
  }, []);

  const recent = useMemo(() => {
    const list = [...applications];
    list.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
    const filtered = statusFilter === 'all' ? list : list.filter(app => (app.status || '').toLowerCase() === statusFilter);
    return filtered.slice(0, 5);
  }, [applications, statusFilter]);

  const onView = (id: string | number) => router.push(`/view-application/${id}`);
  const onEdit = (id: string | number) => router.push(`/edit-application/${id}`);
  const onSubmitDraft = (id: number) => {
    setConfirmMsg('Submit this draft application for review?');
    setConfirmType('info');
    setOnConfirmAction(() => async () => {
      setSubmitting(true);
      const toastId = toast.loading('Submitting application...');
      try {
        await submitApplication(id);
        toast.update(toastId, { render: 'Application submitted!', type: 'success', isLoading: false, autoClose: 3000 });
        await getApplicationsByTIN();
      } catch (e: any) {
        toast.update(toastId, { render: e?.message || 'Failed to submit', type: 'error', isLoading: false, autoClose: 5000 });
      } finally {
        setSubmitting(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Applications</h3>
          <p className="text-gray-500 text-theme-xs dark:text-gray-400">Your five most recent submissions</p>
        </div>

        <div className="relative flex items-center gap-3">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(v => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <ChevronDownIcon />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {(['all','draft','submitted','processing','approved','rejected'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setStatusFilter(opt); setIsFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${statusFilter === opt ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}`}
                  >
                    {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/my-applications')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        {isLoading ? (
          <div className="py-6"><Loader /></div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Project</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Waiver Type</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recent.map(app => {
                const statusKey = (app.status || '').toLowerCase();
                return (
                  <TableRow key={app.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03]">
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{app.projectName}</p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">Ref: {app.referenceNumber || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-600 text-theme-sm dark:text-gray-300">{`Type ${app.applicationTypeId}`}</TableCell>
                    <TableCell className="py-3 text-gray-600 text-theme-sm dark:text-gray-300">{new Date(app.submissionDate).toLocaleDateString()}</TableCell>
                    <TableCell className="py-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${statusStyles[statusKey]?.class || ''}`}>
                        {statusStyles[statusKey]?.icon}
                        {app.status}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onView(app.id)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                          title="View"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {(app.status || '').toLowerCase() === 'draft' && (
                          <>
                            <button
                              onClick={() => onEdit(app.id)}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                              title="Edit"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onSubmitDraft(Number(app.id))}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                              title="Submit"
                            >
                              <PaperPlaneIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {recent.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-gray-500 dark:text-gray-400">No recent applications found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <EnhancedConfirmationDialog
        isOpen={confirmOpen}
        message={confirmMsg}
        onConfirm={onConfirmAction}
        onCancel={() => setConfirmOpen(false)}
        isSubmitting={submitting}
        type={confirmType}
      />
    </div>
  );
}
