import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { NovaLogo } from '../components/brand/NovaLogo';
import { downloadOrPrintOfferLetter } from '../utils/offerLetterPdf';
import { 
  FileSignature, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  MapPin, 
  User, 
  DollarSign, 
  Clock, 
  Award,
  Sparkles,
  Printer
} from 'lucide-react';

export const OfferLetterPage = () => {
  const { offerLetter, acceptOfferLetter, employee } = useOnboarding();
  const [signatureName, setSignatureName] = useState(employee.name);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = (e) => {
    e.preventDefault();
    if (!agreed) return;
    setIsSubmitting(true);
    setTimeout(() => {
      acceptOfferLetter(signatureName);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <FileSignature className="w-3.5 h-3.5" />
            <span>Legal Employment Agreement • Stage 3</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Employment Offer Letter</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official terms of appointment, compensation architecture, and electronic acceptance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {offerLetter.isAccepted ? (
            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Digitally Executed
            </span>
          ) : (
            <span className="px-3.5 py-1.5 bg-amber-50 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Pending Acceptance
            </span>
          )}
        </div>
      </div>

      {/* Acceptance Status Banner */}
      {offerLetter.isAccepted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Offer Successfully Accepted & Signed</p>
              <p className="text-[11px] text-emerald-700">
                Executed by {offerLetter.signature} on {offerLetter.acceptedAt}.
              </p>
            </div>
          </div>
          <button
            onClick={() => downloadOrPrintOfferLetter(offerLetter, employee)}
            className="px-4 py-2 bg-white text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
            title="Download or Print Signed PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Signed Copy (PDF)</span>
          </button>
        </div>
      )}

      {/* Official Offer Letter Document */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-nova-md space-y-8">
        
        {/* Document Header & Reference */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <NovaLogo showText={true} />
          <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
            <p className="font-bold text-slate-900">NOVA Technologies Pvt. Ltd.</p>
            <p>Tower B, Cyber City, Sector 62</p>
            <p>Chandigarh, Punjab 160062</p>
            <p className="text-indigo-600 font-semibold pt-1">Ref Code: {offerLetter.refNo}</p>
            <p className="text-[11px] text-slate-400">Issued Date: {offerLetter.issueDate}</p>
          </div>
        </div>

        {/* Recipient Letter Intro */}
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-sm text-slate-900">Dear {offerLetter.employeeName},</p>
          <p>
            On behalf of NOVA Technologies Pvt. Ltd., we are delighted to formally extend an offer of employment for the position of <strong>{offerLetter.designation}</strong> in our <strong>{offerLetter.department}</strong> division.
          </p>
          <p>
            Your technical expertise, engineering vision, and collaborative mindset stood out throughout our interview rounds. We are confident you will make an outstanding addition to the team.
          </p>
        </div>

        {/* Key Appointment Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70 text-xs">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Position / Role</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{offerLetter.designation}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</p>
            <p className="font-semibold text-slate-800 mt-0.5">{offerLetter.department}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reporting Manager</p>
            <p className="font-semibold text-slate-800 mt-0.5">{offerLetter.reportingManager}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Joining Date</p>
            <p className="font-semibold text-slate-800 mt-0.5">{offerLetter.joiningDate}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Work Location</p>
            <p className="font-semibold text-slate-800 mt-0.5">{offerLetter.workLocation}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Annual CTC</p>
            <p className="font-black text-indigo-700 text-sm mt-0.5">{offerLetter.ctc}</p>
          </div>
        </div>

        {/* Salary Component Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Annexure A — Compensation Breakdown (INR)
            </h4>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Total CTC: {offerLetter.ctc}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-nova-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Component</th>
                  <th className="py-3 px-4">Annual (₹)</th>
                  <th className="py-3 px-4">Monthly (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {offerLetter.salaryBreakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-800">{item.component}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{item.annual}</td>
                    <td className="py-2.5 px-4 text-slate-600">{item.monthly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employment Terms & Conditions */}
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Annexure B — Summary of Employment Terms
          </h4>
          <p>
            1. <strong>Probation & Confirmation:</strong> You will be on probation for a period of {offerLetter.probation}. Following satisfactory performance evaluation, your employment will be confirmed in writing.
          </p>
          <p>
            2. <strong>Notice Period:</strong> {offerLetter.noticePeriod}.
          </p>
          <p>
            3. <strong>Confidentiality & Non-Disclosure:</strong> You agree to maintain absolute confidentiality regarding company technical architectures, customer data, and trade secrets in accordance with the NDA agreement.
          </p>
          <p>
            4. <strong>Code of Conduct:</strong> Employment is subject to adherence to NOVA Tech company policies, ethical standards, and workplace safety mandates.
          </p>
        </div>

        {/* Digital Signature & Acceptance Block */}
        <div className="pt-6 border-t border-slate-200">
          {offerLetter.isAccepted ? (
            <div className="bg-emerald-50/80 border border-emerald-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Electronic Acceptance Hash
                </span>
                <p className="font-serif italic text-2xl text-emerald-950 font-bold mt-1">
                  {offerLetter.signature}
                </p>
                <p className="text-xs text-emerald-800 font-medium">
                  Accepted on {offerLetter.acceptedAt}
                </p>
                <p className="text-[10px] font-mono text-emerald-700 truncate max-w-sm">
                  {offerLetter.hash}
                </p>
              </div>

              <div className="text-right sm:text-right">
                <p className="font-serif italic text-base text-slate-800 font-semibold">Priya Sharma</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">People & Culture Lead</p>
                <p className="text-[10px] text-slate-400">NOVA Technologies Authorized Signatory</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAccept} className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-indigo-600" />
                <span>Digital Acceptance & Signature</span>
              </h4>

              <label className="flex items-center gap-3 text-xs text-slate-800 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="font-medium">
                  I accept the appointment offer, compensation terms, and corporate policies outlined in this letter.
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Digital Signature (Full Legal Name)
                  </label>
                  <input 
                    type="text"
                    required
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Type full legal name"
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-serif bg-white"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!agreed || isSubmitting}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Processing Acceptance...' : 'Accept & Sign Offer'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
