import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  HeartPulse, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  IdCard,
  Edit3,
  X,
  Lock,
  Loader2,
  Clock,
  UserCheck
} from 'lucide-react';

export const ProfilePage = () => {
  const { employee, updateEmployee } = useOnboarding();
  const { systemRole, user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form state initialized with employee context data
  const [formData, setFormData] = useState({
    phone: employee?.phone || '+91 98765 43210',
    dateOfBirth: employee?.dateOfBirth || '1998-07-14',
    bloodGroup: employee?.bloodGroup || 'O+',
    address: employee?.address || 'Flat 402, Silicon Heights, Sector 62',
    city: employee?.city || 'Chandigarh',
    state: employee?.state || 'Punjab',
    pincode: employee?.pincode || '160062',
    emergencyContactName: employee?.emergencyContact?.name || 'Sunita Kumar',
    emergencyContactPhone: employee?.emergencyContact?.phone || '+91 98765 11223',
    emergencyContactRelation: employee?.emergencyContact?.relation || 'Mother'
  });

  // Keep form data synchronized whenever employee state updates
  useEffect(() => {
    if (employee && !isEditing) {
      setFormData({
        phone: employee.phone || '+91 98765 43210',
        dateOfBirth: employee.dateOfBirth || '1998-07-14',
        bloodGroup: employee.bloodGroup || 'O+',
        address: employee.address || 'Flat 402, Silicon Heights, Sector 62',
        city: employee.city || 'Chandigarh',
        state: employee.state || 'Punjab',
        pincode: employee.pincode || '160062',
        emergencyContactName: employee.emergencyContact?.name || 'Sunita Kumar',
        emergencyContactPhone: employee.emergencyContact?.phone || '+91 98765 11223',
        emergencyContactRelation: employee.emergencyContact?.relation || 'Mother'
      });
    }
  }, [employee, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleCancel = () => {
    // Reset to current employee state and return to View mode
    setFormData({
      phone: employee?.phone || '+91 98765 43210',
      dateOfBirth: employee?.dateOfBirth || '1998-07-14',
      bloodGroup: employee?.bloodGroup || 'O+',
      address: employee?.address || 'Flat 402, Silicon Heights, Sector 62',
      city: employee?.city || 'Chandigarh',
      state: employee?.state || 'Punjab',
      pincode: employee?.pincode || '160062',
      emergencyContactName: employee?.emergencyContact?.name || 'Sunita Kumar',
      emergencyContactPhone: employee?.emergencyContact?.phone || '+91 98765 11223',
      emergencyContactRelation: employee?.emergencyContact?.relation || 'Mother'
    });
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validation
    const phoneDigits = (formData.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setErrorMessage('Please provide a valid phone number (between 7 and 15 digits).');
      return;
    }

    if (!formData.city.trim()) {
      setErrorMessage('City/location is required and cannot be blank.');
      return;
    }

    const ecDigits = (formData.emergencyContactPhone || '').replace(/\D/g, '');
    if (ecDigits && ecDigits.length < 7) {
      setErrorMessage('Emergency contact phone number must contain at least 7 digits.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateEmployee({
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: {
          name: formData.emergencyContactName.trim(),
          phone: formData.emergencyContactPhone.trim(),
          relation: formData.emergencyContactRelation
        }
      });

      setSuccessMessage('Profile updated successfully! All records have been verified and saved.');
      setIsEditing(false);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error('[ProfilePage] Save failed:', err);
      setErrorMessage(err.message || 'Failed to update profile. Please verify input fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRole = systemRole || user?.system_role || employee?.system_role || 'EMPLOYEE';
  const roleDisplayBadge = {
    EMPLOYEE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    HR_MANAGER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
  }[currentRole] || 'bg-indigo-50 text-indigo-700 border-indigo-200';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Compliance & Identity Record &bull; Stage 1</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Employee Profile</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain your verified personal identity, contact details, and emergency reachability records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Cancel Edit</span>
            </button>
          )}

          <span className="px-3 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Profile</span>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-semibold animate-in fade-in zoom-in-95 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-900 font-semibold animate-in fade-in zoom-in-95 duration-150">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Profile Summary Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img 
            src={employee?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'} 
            alt={employee?.name} 
            className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-md"
          />
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Active Corporate Account"></span>
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-xl font-bold text-slate-900">{employee?.name}</h3>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
              {employee?.designation || employee?.role || 'Software Engineer'}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${roleDisplayBadge}`}>
              {currentRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Employee ID: <strong className="text-slate-800">{employee?.employee_id || employee?.employeeId || employee?.id}</strong> &bull; Division: <strong className="text-slate-800">{employee?.department}</strong>
          </p>
          <p className="text-xs text-slate-400">
            Reporting to <strong className="text-slate-600">{employee?.manager?.name || 'Arjun Mehta'}</strong> ({employee?.manager?.role || 'Engineering Director'})
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. Official Corporate Identity Records (Strictly Read-Only) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Official Corporate Records</span>
            </h4>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
              <Lock className="w-3 h-3 text-slate-400" />
              Corporate Managed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Legal Name
              </label>
              <input 
                type="text"
                disabled
                value={employee?.name || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-600 font-medium border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Employee ID
              </label>
              <input 
                type="text"
                disabled
                value={employee?.employee_id || employee?.employeeId || employee?.id || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-600 font-medium border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Corporate Email Address
              </label>
              <input 
                type="email"
                disabled
                value={employee?.email || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-600 font-medium border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>

            {/* Designation / Job Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Job Title / Designation
              </label>
              <input 
                type="text"
                disabled
                value={employee?.designation || employee?.role || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-600 font-medium border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department / Business Unit
              </label>
              <input 
                type="text"
                disabled
                value={employee?.department || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-600 font-medium border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>

            {/* System Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Security & RBAC System Role
              </label>
              <input 
                type="text"
                disabled
                value={currentRole}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-600 font-bold border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Joining Date
              </label>
              <input 
                type="text"
                disabled
                value={employee?.joining_date || employee?.joiningDate || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-600 font-medium border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>

            {/* Reporting Manager */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Reporting Manager
              </label>
              <input 
                type="text"
                disabled
                value={`${employee?.manager?.name || 'Arjun Mehta'} (${employee?.manager?.role || 'Engineering Director'})`}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-600 font-medium border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>

            {/* Work Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assigned Office Location
              </label>
              <input 
                type="text"
                disabled
                value={employee?.location || 'NOVA Tech – Chandigarh Office'}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-600 font-medium border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* 2. Personal & Contact Details (Editable in Edit Mode) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              <span>Contact & Personal Details</span>
            </h4>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              {isEditing ? 'Editing Mode' : 'Read-Only View'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phone Number {isEditing && <span className="text-rose-500">*</span>}
              </label>
              <input 
                type="tel"
                name="phone"
                required
                disabled={!isEditing}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current City / Location {isEditing && <span className="text-rose-500">*</span>}
              </label>
              <input 
                type="text"
                name="city"
                required
                disabled={!isEditing}
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Chandigarh / Bangalore"
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                disabled={!isEditing}
                value={formData.bloodGroup}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                }`}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Street Address */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Residential Street Address
              </label>
              <input 
                type="text"
                name="address"
                disabled={!isEditing}
                value={formData.address}
                onChange={handleChange}
                placeholder="Flat / House Number, Apartment, Street Name"
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                State / Province
              </label>
              <input 
                type="text"
                name="state"
                disabled={!isEditing}
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Punjab / Karnataka"
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Postal Pincode
              </label>
              <input 
                type="text"
                name="pincode"
                disabled={!isEditing}
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 160062"
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date of Birth
              </label>
              <input 
                type="date"
                name="dateOfBirth"
                disabled={!isEditing}
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 3. Emergency Contact Details (Editable in Edit Mode) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Emergency Contact Details</span>
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">
              For workplace safety & critical notifications
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Contact Person Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Contact Person Name {isEditing && <span className="text-rose-500">*</span>}
              </label>
              <input 
                type="text"
                name="emergencyContactName"
                required={isEditing}
                disabled={!isEditing}
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="e.g. Sunita Kumar"
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Relationship
              </label>
              <select
                name="emergencyContactRelation"
                disabled={!isEditing}
                value={formData.emergencyContactRelation}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                }`}
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling (Brother / Sister)</option>
                <option value="Guardian">Guardian / Relative</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Emergency Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Emergency Phone Number {isEditing && <span className="text-rose-500">*</span>}
              </label>
              <input 
                type="tel"
                name="emergencyContactPhone"
                required={isEditing}
                disabled={!isEditing}
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="+91 98765 11223"
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action Bar (Only visible when in Edit Mode) */}
        {isEditing && (
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-150">
            <p className="text-xs text-slate-500">
              Saving updates your personal records and synchronizes your employee compliance status.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
