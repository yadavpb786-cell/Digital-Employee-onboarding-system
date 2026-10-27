import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  FileUp, 
  Trash2, 
  FileCheck 
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/pjpeg'];

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const DocumentUploadModal = ({ 
  isOpen, 
  onClose, 
  defaultDocName = '', 
  defaultCategory = 'Identification' 
}) => {
  const { uploadDocument } = useOnboarding();
  const [docName, setDocName] = useState(defaultDocName);
  const [category, setCategory] = useState(defaultCategory);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const categories = [
    'Identification',
    'Academic',
    'Legal',
    'Finance',
    'Employment',
    'HR Compliance'
  ];

  const validateAndSetFile = (file) => {
    setValidationError(null);
    setServerError(null);

    if (!file) return false;

    // 1. Check extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError(`Unsupported file type "${ext}". Only PDF, JPG, and PNG files are allowed.`);
      setSelectedFile(null);
      return false;
    }

    // 2. Check MIME type (if provided by browser)
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      setValidationError(`Invalid file format "${file.type}". Please upload a genuine PDF, JPG, or PNG document.`);
      setSelectedFile(null);
      return false;
    }

    // 3. Check file size (Max 10 MB)
    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File is too large (${formatFileSize(file.size)}). Maximum permitted file size is 10 MB.`);
      setSelectedFile(null);
      return false;
    }

    if (file.size === 0) {
      setValidationError('The selected file is empty (0 bytes). Please select a valid document.');
      setSelectedFile(null);
      return false;
    }

    // File is valid
    setSelectedFile(file);
    if (!docName.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      setDocName(cleanName);
    }
    return true;
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError(null);
    setServerError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    if (!selectedFile) {
      setValidationError('Please select a file to upload (PDF, JPG, or PNG).');
      return;
    }

    if (!docName.trim()) {
      setValidationError('Document title is required.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', docName.trim());
      formData.append('document_type', category);
      formData.append('type', category);
      formData.append('is_required', 'true');

      // Update progress visualization
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 150);

      await uploadDocument(formData);

      clearInterval(progressTimer);
      setUploadProgress(100);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setDocName('');
        setSelectedFile(null);
        setUploadProgress(0);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('[DocumentUploadModal] Upload failed:', err);
      const message = err.message || 'Failed to upload document. Please ensure the file is valid and try again.';
      setServerError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Upload Compliance Document</h3>
              <p className="text-xs text-slate-400">Encrypted 256-bit employee vault storage</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-50 duration-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Document Uploaded Successfully!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              "{docName}" has been safely encrypted and saved. Awaiting verification by HR Operations.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-600">
              Updating vault records...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Server Error Alert */}
            {serverError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Upload Failed</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">{serverError}</p>
                </div>
              </div>
            )}

            {/* Client Validation Error Alert */}
            {validationError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Invalid File or Field</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">{validationError}</p>
                </div>
              </div>
            )}

            {/* Document Title input */}
            <div>
              <label htmlFor="doc-title-input" className="block text-xs font-bold text-slate-700 mb-1">
                Document Name / Title <span className="text-rose-500">*</span>
              </label>
              <input 
                id="doc-title-input"
                type="text"
                required
                disabled={isUploading}
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Passport / PAN Card / Degree Certificate"
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all disabled:bg-slate-50"
              />
            </div>

            {/* Category selection */}
            <div>
              <label htmlFor="doc-category-select" className="block text-xs font-bold text-slate-700 mb-1">
                Document Classification
              </label>
              <select
                id="doc-category-select"
                value={category}
                disabled={isUploading}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white disabled:bg-slate-50"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* File Attachment Zone with Real Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                File Attachment (PDF, JPG, PNG &bull; Max 10 MB) <span className="text-rose-500">*</span>
              </label>
              
              {/* Hidden Real File Input */}
              <input 
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileInputChange}
              />

              {!selectedFile ? (
                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-150 group ${
                    isDragging 
                      ? 'border-indigo-600 bg-indigo-100/60 ring-2 ring-indigo-500/30' 
                      : 'border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80'
                  }`}
                >
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2 group-hover:-translate-y-0.5 transition-transform" />
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag and drop your file here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports PDF, JPG, and PNG files up to 10 MB
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-indigo-700">
                        Size: {formatFileSize(selectedFile.size)} &bull; {selectedFile.type || 'Document'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isUploading}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar during upload */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Encrypting and uploading to vault...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedFile || !docName.trim()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-nova-sm transition-all flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Submit Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
