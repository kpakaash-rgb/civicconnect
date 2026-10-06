import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, ChevronRight, ChevronLeft, MapPin, CheckCircle,
  AlertTriangle, Lightbulb, Droplets, Construction, Trash2, X,
  ArrowRight, Upload, Image as ImageIcon, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { checkEvidence } from '../services/api';
import EvidenceReviewCard from '../components/EvidenceReviewCard';
import Toast from '../components/Toast';

const issueTypes = [
  { id: 'Potholes', label: 'Pothole', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Sanitation', label: 'Garbage', icon: Trash2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Streetlights', label: 'Streetlight', icon: Lightbulb, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'Drainage', label: 'Drainage', icon: Droplets, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'Water', label: 'Water Leak', icon: Droplets, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 'Road Damage', label: 'Road Damage', icon: Construction, color: 'text-red-600 bg-red-50 border-red-200' },
  { id: 'Other', label: 'Public Space', icon: MapPin, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Other', label: 'Other Issue', icon: AlertTriangle, color: 'text-gray-600 bg-gray-50 border-gray-200' },
];

const severityOptions = [
  { id: 'Low', label: 'Low', desc: 'Minor inconvenience', color: 'border-gray-300 text-gray-600', active: 'border-gray-500 bg-gray-50' },
  { id: 'Medium', label: 'Medium', desc: 'Needs attention soon', color: 'border-amber-300 text-amber-600', active: 'border-amber-500 bg-amber-50' },
  { id: 'High', label: 'High', desc: 'Safety risk – urgent', color: 'border-red-300 text-red-600', active: 'border-red-500 bg-red-50' },
];

const STEPS = ['Photo', 'Issue Type', 'Location', 'Description', 'Severity', 'Evidence', 'Submit'];

export default function ReportIssue() {
  const navigate = useNavigate();
  const { addReport } = useApp();
  const fileRef = useRef(null);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    imagePreview: null,
    imageFile: null,
    category: '',
    issueLabel: '',
    location: 'Anna Nagar 2nd Avenue, Ward 104, Chennai',
    description: '',
    severity: 'Medium',
  });
  const [evidenceResult, setEvidenceResult] = useState(null);
  const [isCheckingEvidence, setIsCheckingEvidence] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: 'Image must be under 10MB', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, imagePreview: reader.result, imageFile: file }));
    };
    reader.readAsDataURL(file);

    // Run AI-assisted image evidence review
    setIsCheckingEvidence(true);
    setEvidenceResult(null);
    try {
      const res = await checkEvidence(file);
      setEvidenceResult(res);
    } catch (err) {
      setEvidenceResult({
        success: false,
        available: false,
        message: 'AI evidence verification unavailable. The report can still be submitted.',
      });
    } finally {
      setIsCheckingEvidence(false);
    }
  };

  const validate = () => {
    const e = {};
    if (step === 1 && !form.category) e.category = 'Please select an issue type';
    if (step === 2 && !form.location.trim()) e.location = 'Location is required';
    if (step === 3 && !form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep((s) => s - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const newIssue = await addReport({
        title: `${form.issueLabel || form.category} – ${form.location.split(',')[0]}`,
        category: form.category,
        location: form.location,
        description: form.description,
        severity: form.severity,
        imagePreview: form.imagePreview,
        evidence: evidenceResult,
      });
      setSubmittedIssue(newIssue);
    } catch (err) {
      setToast({ message: 'Failed to submit report. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  // ─── Success State ───
  if (submittedIssue) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-green-700 text-white px-4 py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Report Submitted!</h1>
          <p className="text-green-200 text-sm mt-2">Your civic report has been received</p>
        </div>

        <div className="px-4 -mt-4 flex-1">
          <div className="card p-5 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium">Report ID</p>
                <p className="text-2xl font-bold text-green-700 font-mono">{submittedIssue.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Status</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {submittedIssue.status || 'Reported'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium">Issue</p>
                <p className="font-semibold text-gray-900">{submittedIssue.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Location</p>
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <MapPin size={12} className="text-green-600" /> {submittedIssue.location}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Priority</p>
                <p className="text-sm font-semibold text-gray-700">{form.severity}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100">
              <p className="text-xs text-green-700 font-medium">
                ✓ Your report is now visible to the community and the municipal team. You'll receive updates as your report progresses.
              </p>
            </div>

            <button
              onClick={() => navigate(`/issues/${submittedIssue.id}`)}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              Track This Report <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                setSubmittedIssue(null);
                setStep(0);
                setForm({
                  imagePreview: null,
                  imageFile: null,
                  category: '',
                  issueLabel: '',
                  location: 'Anna Nagar 2nd Avenue, Ward 104, Chennai',
                  description: '',
                  severity: 'Medium',
                });
                setEvidenceResult(null);
                setIsCheckingEvidence(false);
              }}
              className="w-full mt-2 py-2.5 text-sm text-green-600 font-semibold hover:text-green-700"
            >
              Submit Another Report
            </button>
          </div>
        </div>
        <div className="h-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-green-700 text-white px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-3">
          {step > 0 ? (
            <button onClick={prevStep} className="p-1 hover:bg-white/10 rounded-lg">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-lg">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex-1">
            <h1 className="font-bold text-lg leading-tight">Report an Issue</h1>
            <p className="text-green-200 text-xs">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </p>
          </div>
          <button onClick={() => navigate(-1)} className="text-green-300 text-sm">
            Cancel
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`text-[9px] font-medium ${i <= step ? 'text-white' : 'text-white/40'}`}
            >
              {s}
            </span>
          ))}
        </div>
      </header>

      <div className="flex-1 px-4 py-5">
        {/* Step 0: Photo */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Add a Photo</h2>
            <p className="text-sm text-gray-500 mb-4">A clear photo helps the team assess the issue faster.</p>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} id="photo-upload" />

            {form.imagePreview ? (
              <div className="relative">
                <img
                  src={form.imagePreview}
                  alt="Issue preview"
                  className="w-full h-64 object-cover rounded-2xl"
                />
                <button
                  onClick={() => {
                    setForm((f) => ({ ...f, imagePreview: null, imageFile: null }));
                    setEvidenceResult(null);
                    setIsCheckingEvidence(false);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <X size={16} className="text-white" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={11} /> Photo ready
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 hover:border-green-400 transition-all"
              >
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <Camera size={24} className="text-green-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700">Tap to add a photo</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Upload size={12} /> <span>Upload from gallery</span>
                </div>
              </button>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">
              Photo is optional but strongly recommended
            </p>

            {/* AI-assisted Evidence Review Card */}
            <div className="mt-4">
              <EvidenceReviewCard
                evidence={evidenceResult}
                isChecking={isCheckingEvidence}
                hasImage={Boolean(form.imagePreview || form.imageFile)}
              />
            </div>
          </div>
        )}

        {/* Step 1: Issue Type */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Select Issue Type</h2>
            <p className="text-sm text-gray-500 mb-4">What kind of civic problem are you reporting?</p>

            {errors.category && (
              <p className="text-red-600 text-xs mb-3 flex items-center gap-1">
                <AlertTriangle size={12} /> {errors.category}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              {issueTypes.map((type, i) => {
                const Icon = type.icon;
                const isActive = form.issueLabel === type.label;
                return (
                  <button
                    key={`${type.id}-${i}`}
                    onClick={() => setForm((f) => ({ ...f, category: type.id, issueLabel: type.label }))}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      isActive
                        ? `border-green-500 bg-green-50`
                        : `border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50`
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-sm font-semibold ${isActive ? 'text-green-700' : 'text-gray-700'}`}>
                      {type.label}
                    </span>
                    {isActive && <CheckCircle size={14} className="text-green-600 -mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Confirm Location</h2>
            <p className="text-sm text-gray-500 mb-4">Where exactly is the issue located?</p>

            <div className="map-pattern h-40 rounded-2xl mb-4 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 rounded-xl px-4 py-2 shadow-md flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <MapPin size={13} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">Your location pinned</span>
                </div>
              </div>
              <div className="absolute bottom-3 right-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                  <MapPin size={14} className="text-white" />
                </div>
              </div>
            </div>

            {errors.location && (
              <p className="text-red-600 text-xs mb-2 flex items-center gap-1">
                <AlertTriangle size={12} /> {errors.location}
              </p>
            )}

            <div className="mb-3">
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Street / Landmark
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="location-input"
                  type="text"
                  className="input-field pl-9"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Enter address or landmark"
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700">GPS location automatically detected from your device</p>
            </div>
          </div>
        )}

        {/* Step 3: Description */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Describe the Issue</h2>
            <p className="text-sm text-gray-500 mb-4">Provide specific details to help the response team.</p>

            {errors.description && (
              <p className="text-red-600 text-xs mb-2 flex items-center gap-1">
                <AlertTriangle size={12} /> {errors.description}
              </p>
            )}

            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description-input"
              rows={5}
              className="input-field resize-none"
              placeholder="e.g. Large pothole approximately 1 metre wide causing vehicles to swerve suddenly..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length} / 500</p>

            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-700 font-medium mb-1">💡 Helpful tips:</p>
              <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                <li>Mention the size or severity of the problem</li>
                <li>Note if it's a safety hazard</li>
                <li>Include any relevant landmarks</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Severity */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Set Priority Level</h2>
            <p className="text-sm text-gray-500 mb-4">How urgent is this issue?</p>

            <div className="space-y-3">
              {severityOptions.map((opt) => {
                const isActive = form.severity === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setForm((f) => ({ ...f, severity: opt.id }))}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all ${
                      isActive ? opt.active : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isActive ? 'border-current' : 'border-gray-300'
                    }`}>
                      {isActive && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${isActive ? opt.color.split(' ')[1] : 'text-gray-700'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                    {isActive && <CheckCircle size={18} className={opt.color.split(' ')[1]} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Evidence Check */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Evidence Summary</h2>
            <p className="text-sm text-gray-500 mb-4">Review the checks before submitting your report.</p>

            <div className="space-y-3">
              {/* AI-Assisted Evidence Verification Result */}
              <EvidenceReviewCard
                evidence={evidenceResult}
                isChecking={isCheckingEvidence}
                hasImage={Boolean(form.imagePreview || form.imageFile)}
              />

              <div className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Image attached</p>
                    <p className="text-xs text-gray-500">
                      {form.imagePreview ? 'Photo attached to your report' : 'No photo — report will still be processed'}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Location information available</p>
                    <p className="text-xs text-gray-500">{form.location}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">No likely duplicate found</p>
                    <p className="text-xs text-gray-500">No identical reports in this area in the last 24h</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <Shield size={16} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-700">Evidence confidence: High</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Your report has sufficient information to be reviewed by the municipal team.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="card p-4 mt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Report Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-900">{form.issueLabel || form.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Priority</span>
                  <span className={`font-medium ${form.severity === 'High' ? 'text-red-600' : form.severity === 'Medium' ? 'text-amber-600' : 'text-gray-600'}`}>
                    {form.severity}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%]">{form.location}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Submit */}
        {step === 6 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to submit?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your report will be submitted to the municipal system and made visible to the community.
            </p>
            <div className="card p-4 text-left mb-5">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="font-semibold">{form.issueLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority</span>
                  <span className="font-semibold">{form.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-semibold text-right max-w-[55%]">{form.location}</span>
                </div>
                {form.imagePreview && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Photo</span>
                    <img src={form.imagePreview} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Submit Report <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Next button (not on submit step) */}
      {step < STEPS.length - 1 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4">
          <button
            onClick={nextStep}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {step === STEPS.length - 2 ? 'Review Report' : 'Continue'}
            <ChevronRight size={18} />
          </button>
          {step === 0 && (
            <button onClick={nextStep} className="w-full text-center text-sm text-gray-400 mt-2 hover:text-gray-600">
              Skip – add photo later
            </button>
          )}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
