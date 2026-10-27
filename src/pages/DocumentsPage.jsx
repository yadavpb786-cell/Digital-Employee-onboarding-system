import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { DocumentUploadModal } from '../components/ui/DocumentUploadModal';
import { 
  FileText, 
  Upload, 
  Download, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Plus, 
  Check, 
  RotateCcw,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';

export const DocumentsPage = () => {
  const { documents, updateDocumentStatus } = useOnboarding();
  const [filter, setFilter] = useState('all'); // all, verified, pending, actionRequired
  const [viewMode, setViewMode] = useState('cards'); // cards, table
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUploadDoc, setSelectedUploadDoc] = useState(null);

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Pending Verification
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'Not Uploaded':
      default:
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Not Uploaded
          </span>
        );
    }
  };

  const getDocumentDownloadUrl = (doc) => {
    if (!doc) return null;
    if (doc.file_url) return doc.file_url;
    if (doc.file && typeof doc.file === 'string' && doc.file.startsWith('http')) return doc.file;
    if (doc.id && !String(doc.id).startsWith('doc-')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
      return `${baseUrl.replace(/\/$/, '')}/documents/${doc.id}/download/`;
    }
    return null;
  };

  const filteredDocs = documents.filter(doc => {
    if (filter === 'verified') return doc.verificationStatus === 'Verified';
    if (filter === 'pending') return doc.verificationStatus === 'Pending Verification';
    if (filter === 'actionRequired') return doc.verificationStatus === 'Rejected' || doc.verificationStatus === 'Not Uploaded';
    return true;
  });

  const verifiedCount = documents.filter(d => d.verificationStatus === 'Verified').length;
  const pendingCount = documents.filter(d => d.verificationStatus === 'Pending Verification').length;
  const actionCount = documents.filter(d => d.verificationStatus === 'Rejected' || d.verificationStatus === 'Not Uploaded').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Compliance & Identity Vault &bull; Stage 2</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Document Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit required identity, academic, and banking records for compliance verification.
          </p>
        </div>

        <button 
          onClick={() => {
            setSelectedUploadDoc(null);
            setIsUploadModalOpen(true);
          }}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-2xl shadow-nova-sm flex items-center gap-2 transition-all shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Metrics & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-nova-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'all', label: `All Documents (${documents.length})` },
            { key: 'verified', label: `Verified (${verifiedCount})` },
            { key: 'pending', label: `Pending Review (${pendingCount})` },
            { key: 'actionRequired', label: `Action Required (${actionCount})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white shadow-nova-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Verification Summary Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Status: <strong>{verifiedCount} of {documents.length}</strong> required documents verified</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Encrypted Storage Active: Uploaded files are safely stored and verified by HR Operations.
        </span>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const isVerified = doc.verificationStatus === 'Verified';
            const isPending = doc.verificationStatus === 'Pending Verification';
            const isRejected = doc.verificationStatus === 'Rejected';
            const isNotUploaded = doc.verificationStatus === 'Not Uploaded';
            const fileUrl = getDocumentDownloadUrl(doc);
            const hasActualFile = Boolean(doc.file || fileUrl);

            return (
              <div 
                key={doc.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-nova-sm hover:shadow-nova-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {doc.type}
                    </span>
                    {getVerificationBadge(doc.verificationStatus)}
                  </div>

                  <div className="flex items-start gap-3 mt-3">
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isVerified ? 'bg-emerald-50 text-emerald-600' : isRejected ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {doc.uploadStatus} &bull; {doc.size || '1.5 MB'} &bull; {doc.date}
                      </p>
                    </div>
                  </div>

                  {/* HR Remarks */}
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                      HR Verification Remarks:
                    </p>
                    <p className="text-[11px] italic">{doc.remarks || 'No remarks provided.'}</p>
                  </div>
                </div>

                {/* Footer Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  
                  {/* Left: View / Download & Upload Buttons */}
                  <div className="flex items-center gap-2">
                    {hasActualFile && fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View / Download</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic px-1">
                        Pre-seeded Record
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setSelectedUploadDoc(doc);
                        setIsUploadModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isRejected ? 'Re-upload' : hasActualFile ? 'Replace' : 'Upload'}</span>
                    </button>
                  </div>

                  {/* Right: Simulation controls for evaluators */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateDocumentStatus(doc.id, 'Verified', 'Verified & approved by HR operations.')}
                      title="Simulate HR Approval"
                      className="px-2 py-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
                    >
                      &check; Approve
                    </button>
                    <button
                      onClick={() => updateDocumentStatus(doc.id, 'Rejected', 'Document scan was blurry. Please re-upload.')}
                      title="Simulate HR Rejection"
                      className="px-2 py-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors"
                    >
                      &cross; Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-nova-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Document Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Upload Status</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">HR Remarks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDocs.map((doc) => {
                  const fileUrl = getDocumentDownloadUrl(doc);
                  const hasActualFile = Boolean(doc.file || fileUrl);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <p>{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{doc.size || '1.5 MB'} &bull; {doc.date}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{doc.type}</td>
                      <td className="py-3 px-4 text-slate-600">{doc.uploadStatus}</td>
                      <td className="py-3 px-4">{getVerificationBadge(doc.verificationStatus)}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">{doc.remarks}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasActualFile && fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>View</span>
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUploadDoc(doc);
                              setIsUploadModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            {hasActualFile ? 'Replace' : 'Upload'}
                          </button>
                          <button
                            onClick={() => updateDocumentStatus(doc.id, 'Verified', 'Approved by HR operations.')}
                            className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100"
                          >
                            Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedUploadDoc(null);
        }}
        defaultDocName={selectedUploadDoc ? selectedUploadDoc.name : ''}
        defaultCategory={selectedUploadDoc ? (selectedUploadDoc.type || selectedUploadDoc.document_type) : 'Identification'}
      />
    </div>
  );
};
