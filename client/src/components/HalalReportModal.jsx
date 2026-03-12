import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_HALAL_API_URL || 'http://localhost:3001/api/v1/halal';

const REPORT_TYPES = [
  { value: 'confirm_halal',    label: '✅ Confirm Halal',        desc: 'I can verify this restaurant is halal.' },
  { value: 'zabiha_confirmed', label: '🏅 Zabiha Confirmed',      desc: 'Meat is hand-slaughtered (zabiha).' },
  { value: 'deny_halal',       label: '❌ Not Halal',             desc: 'This restaurant is not halal.' },
  { value: 'pork_found',       label: '🚫 Pork Found',            desc: 'Pork or pork products are served here.' },
  { value: 'alcohol_served',   label: '🍺 Alcohol Served',        desc: 'Alcohol is sold or served here.' },
  { value: 'not_zabiha',       label: '⚠️ Not Zabiha',           desc: 'Halal but not hand-slaughtered.' },
];

const HalalReportModal = ({ restaurantId, restaurantName, isOpen, onClose, onSuccess }) => {
  const [reportType, setReportType] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportType) {
      toast.error('Please select a report type.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/${restaurantId}/report`, {
        reporter_name: reporterName || 'Anonymous',
        report_type: reportType,
        notes,
      });
      toast.success('Thank you! Your report helps the community.');
      onSuccess && onSuccess();
      onClose();
      setReportType('');
      setReporterName('');
      setNotes('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-halal-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <Dialog.Title className="text-white font-bold text-lg">Report Halal Status</Dialog.Title>
                  <p className="text-halal-200 text-sm">{restaurantName}</p>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Report type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Report Type *
                  </label>
                  <div className="space-y-2">
                    {REPORT_TYPES.map(rt => (
                      <label
                        key={rt.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          reportType === rt.value
                            ? 'border-halal-700 bg-halal-50 dark:bg-halal-950'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportType"
                          value={rt.value}
                          checked={reportType === rt.value}
                          onChange={e => setReportType(e.target.value)}
                          className="mt-0.5 accent-halal-700"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{rt.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{rt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={e => setReporterName(e.target.value)}
                    placeholder="Anonymous"
                    className="input-field"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Additional Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Any additional details..."
                    className="input-field resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !reportType}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default HalalReportModal;
