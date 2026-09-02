import React, { useState } from 'react';
import { FileUp, CheckCircle, Clock, FileText, Download, Upload, ShieldCheck } from 'lucide-react';

export const DocumentsPage = () => {
  const [docs, setDocs] = useState([
    { id: 1, name: 'Passport / National ID Proof', category: 'Identity', status: 'Verified', date: 'Sep 01, 2026', size: '2.4 MB' },
    { id: 2, name: 'Educational Degrees & Transcripts', category: 'Academic', status: 'Verified', date: 'Sep 01, 2026', size: '4.1 MB' },
    { id: 3, name: 'NOVA Tech Signed Offer Letter', category: 'Legal', status: 'Verified', date: 'Aug 28, 2026', size: '1.2 MB' },
    { id: 4, name: 'Direct Deposit Payroll Bank Details', category: 'Finance', status: 'Pending Review', date: 'Sep 02, 2026', size: '850 KB' },
    { id: 5, name: 'Non-Disclosure & IP Agreement (NDA)', category: 'Legal', status: 'Action Required', date: 'Due Sep 18', size: '--' },
    { id: 6, name: 'Emergency Contact Form', category: 'HR', status: 'Action Required', date: 'Due Sep 19', size: '--' },
  ]);

  const handleUploadSim = (id) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'Verified', size: '1.5 MB', date: 'Just now' } : d));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Enterprise Vault</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Document Management</h2>
          <p className="text-xs text-slate-500 mt-1">Upload and manage compliance & payroll documentation.</p>
        </div>

        <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-nova-sm flex items-center gap-2 transition-all">
          <Upload className="w-4 h-4" />
          <span>Upload Custom Document</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-nova-md overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
          <span>Required Document Center</span>
          <span>4 of 6 Documents Verified</span>
        </div>

        <div className="divide-y divide-slate-100">
          {docs.map(doc => (
            <div key={doc.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.category} • {doc.size} • {doc.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  doc.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {doc.status}
                </span>

                {doc.status === 'Action Required' ? (
                  <button 
                    onClick={() => handleUploadSim(doc.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                ) : (
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
