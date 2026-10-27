import React, { useState } from 'react';
import { X, CheckCircle2, FileSignature, Download, ShieldCheck, Building2, MapPin, Calendar, DollarSign, Award } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { NovaLogo } from '../brand/NovaLogo';
import { downloadOrPrintOfferLetter } from '../../utils/offerLetterPdf';

export const OfferLetterModal = ({ isOpen, onClose }) => {
  const { offerLetter, acceptOfferLetter, employee } = useOnboarding();
  const [signatureInput, setSignatureInput] = useState(employee.name);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSign = (e) => {
    e.preventDefault();
    if (!agreedTerms) return;
    setIsSubmitting(true);
    setTimeout(() => {
      acceptOfferLetter(signatureInput);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                Official Employment Agreement
              </span>
              <h3 className="font-bold text-base mt-1 text-white">Employment Offer Letter</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Letter Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-slate-700 bg-slate-50/40">
          
          {/* Status Banner */}
          {offerLetter.isAccepted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2.5 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p>Offer Letter Accepted & Signed</p>
                  <p className="text-[11px] text-emerald-700 font-normal">
                    Digitally signed by {offerLetter.signature} on {offerLetter.acceptedAt}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase bg-emerald-200/60 px-2.5 py-1 rounded text-emerald-800 shrink-0">
                Legally Binding
              </span>
            </div>
          ) : (
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>Action Required: Review your compensation structure and digitally accept this offer.</span>
              </div>
            </div>
          )}

          {/* Official Letter Paper Document */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-nova-sm space-y-6 text-xs">
            
            {/* Letterhead */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <NovaLogo showText={true} />
              <div className="text-right sm:text-right text-[11px] text-slate-500">
                <p className="font-bold text-slate-900">NOVA Technologies Pvt. Ltd.</p>
                <p>Tower B, Cyber City, Sector 62</p>
                <p>Chandigarh, Punjab 160062</p>
                <p className="text-indigo-600 font-semibold mt-1">Ref: {offerLetter.refNo}</p>
              </div>
            </div>

            {/* Candidate Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Candidate Name</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{offerLetter.employeeName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Designation / Role</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{offerLetter.designation}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Department</p>
                <p className="font-semibold text-slate-800 mt-0.5">{offerLetter.department}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Joining Date</p>
                <p className="font-semibold text-slate-800 mt-0.5">{offerLetter.joiningDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Reporting Manager</p>
                <p className="font-semibold text-slate-800 mt-0.5">{offerLetter.reportingManager}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Work Location</p>
                <p className="font-semibold text-slate-800 mt-0.5">{offerLetter.workLocation}</p>
              </div>
            </div>

            {/* Salary Breakdown Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Annual CTC Structure: <span className="text-indigo-600 font-extrabold text-sm ml-1">{offerLetter.ctc}</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-semibold">INR (₹)</span>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-3">Salary Component</th>
                      <th className="py-2.5 px-3">Annual (₹)</th>
                      <th className="py-2.5 px-3">Monthly (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {offerLetter.salaryBreakdown.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-800">{row.component}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.annual}</td>
                        <td className="py-2 px-3 text-slate-600">{row.monthly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Terms */}
            <div className="space-y-1 text-slate-600 leading-relaxed text-[11px]">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Employment Terms:</h5>
              <p>• <strong>Probation:</strong> {offerLetter.probation}. Confirmation subject to performance evaluation.</p>
              <p>• <strong>Notice Period:</strong> {offerLetter.noticePeriod}.</p>
              <p>• <strong>Intellectual Property:</strong> All software, designs, and innovations produced belong exclusively to NOVA Technologies Pvt. Ltd.</p>
            </div>

            {/* Digital Signature Verification Display */}
            {offerLetter.isAccepted && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">Digital Acceptance Seal</span>
                  <span className="text-[9px] font-mono text-emerald-600 truncate max-w-xs">{offerLetter.hash}</span>
                </div>
                <p className="font-serif italic text-base text-emerald-950 font-bold">{offerLetter.signature}</p>
                <p className="text-[10px] text-emerald-700">Digitally accepted on: {offerLetter.acceptedAt}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {!offerLetter.isAccepted ? (
            <form onSubmit={handleSign} className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 w-full sm:w-auto">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    required
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>I accept the employment offer and terms & conditions.</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">Digital Signature:</span>
                  <input 
                    type="text"
                    value={signatureInput}
                    onChange={(e) => setSignatureInput(e.target.value)}
                    placeholder="Type full legal name"
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-serif"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!agreedTerms || isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-2"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>{isSubmitting ? 'Signing...' : 'Accept & Sign Offer'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => downloadOrPrintOfferLetter(offerLetter, employee)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                title="Download or Print Signed PDF"
              >
                <Download className="w-4 h-4" />
                <span>Download Signed Copy (PDF)</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-nova-sm transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
