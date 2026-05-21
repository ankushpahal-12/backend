import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTestStore } from '../store/testStore';
import { FileText, Settings, Clock, Tag, Info, AlertCircle, Shield, Mail } from 'lucide-react';
import { useThemeContext } from '../../../../context/ThemeContext';
import Loader from '../../components/ui/Loader';

/* ─── tiny debounce hook ─────────────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export const TestForm: React.FC = () => {
  const { activeTest, saving, error, updateTestInfo } = useTestStore();
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';

  // ── Local state mirrors – inputs read from here, not from the store ──
  const [title,           setTitle]           = useState(activeTest?.title           ?? '');
  const [description,     setDescription]     = useState(activeTest?.description     ?? '');
  const [category,        setCategory]        = useState(activeTest?.category        ?? '');
  const [instructions,    setInstructions]    = useState(activeTest?.instructions    ?? '');
  const [durationMinutes, setDurationMinutes] = useState(activeTest?.durationMinutes ?? 30);
  const [passingMarks,    setPassingMarks]    = useState(activeTest?.settings?.passingMarks ?? 40);
  const [negativeMarking, setNegativeMarking] = useState(activeTest?.settings?.negativeMarking ?? 0);
  const [visibility,      setVisibility]      = useState(activeTest?.accessControl?.visibility ?? 'public');
  const [assignedEmails,  setAssignedEmails]  = useState<string[]>(activeTest?.assignedEmails?.map((a: any) => a.email) ?? []);
  const [emailInput,      setEmailInput]      = useState('');

  // Sync local state if activeTest changes externally (e.g. on load)
  const prevIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeTest) return;
    const currentId = activeTest.id ?? '__new__';
    if (currentId !== prevIdRef.current) {
      prevIdRef.current = currentId;
      setTitle(activeTest.title           ?? '');
      setDescription(activeTest.description     ?? '');
      setCategory(activeTest.category        ?? '');
      setInstructions(activeTest.instructions    ?? '');
      setDurationMinutes(activeTest.durationMinutes ?? 30);
      setPassingMarks(activeTest.settings?.passingMarks ?? 40);
      setNegativeMarking(activeTest.settings?.negativeMarking ?? 0);
      setVisibility(activeTest.accessControl?.visibility ?? 'public');
      setAssignedEmails(activeTest.assignedEmails?.map((a: any) => a.email) ?? []);
    }
  }, [activeTest]);

  // ── Debounced values – only these trigger the store update ──
  const dTitle           = useDebounce(title,           500);
  const dDescription     = useDebounce(description,     500);
  const dCategory        = useDebounce(category,        500);
  const dInstructions    = useDebounce(instructions,    500);
  const dDurationMinutes = useDebounce(durationMinutes, 500);
  const dPassingMarks    = useDebounce(passingMarks,    500);
  const dNegativeMarking = useDebounce(negativeMarking, 500);
  const dVisibility      = useDebounce(visibility,      500);
  const dAssignedEmails  = useDebounce(assignedEmails,  500);

  // Track which fields are "dirty" so we only call updateTestInfo when they actually changed
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) { initialized.current = true; return; }
    updateTestInfo({
      title:           dTitle,
      description:     dDescription,
      category:        dCategory,
      instructions:    dInstructions,
      durationMinutes: dDurationMinutes,
      accessControl: {
        ...activeTest?.accessControl,
        visibility: dVisibility
      },
      assignedEmails: dAssignedEmails.map(email => ({ email })),
      settings: {
        ...activeTest?.settings,
        passingMarks: Math.max(0, isNaN(dPassingMarks) ? 40 : dPassingMarks),
        negativeMarking: Math.max(0, isNaN(dNegativeMarking) ? 0 : dNegativeMarking)
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dTitle, dDescription, dCategory, dInstructions, dDurationMinutes, dPassingMarks, dNegativeMarking, dVisibility, dAssignedEmails]);

  // ── Settings handlers (no debounce needed — toggles) ──
  const handleSettingChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    await updateTestInfo({
      settings: { ...activeTest?.settings, [name]: checked }
    });
  }, [activeTest, updateTestInfo]);

  if (!activeTest) return null;

  /* ── Styles ── */
  const cardClass = `rounded-2xl p-6 border ${
    isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'
  }`;
  const inputClass = `w-full rounded-xl border px-4 py-2.5 outline-none transition-colors
    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
    isLightMode
      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
      : 'bg-slate-950 border-white/10 text-white placeholder:text-slate-500'
  }`;
  const labelClass = `mb-2 block text-sm font-semibold ${
    isLightMode ? 'text-slate-700' : 'text-slate-300'
  }`;

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          isLightMode
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
        }`}>
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* ── Test Information ── */}
      <div className={cardClass}>
        <div className="mb-6 flex items-center gap-2">
          <FileText className="text-indigo-500" size={20} />
          <h2 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
            Test Information
            {saving && <span className="ml-2 text-xs text-indigo-500">Saving…</span>}
          </h2>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className={labelClass}>Test Title <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter test title (e.g. 'React Basics Quiz')"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of the test..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Duration + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>Duration (mins) <span className="text-rose-500">*</span></span>
                </div>
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)}
                min="1"
                max="480"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <div className="flex items-center gap-1.5">
                  <Tag size={14} className="text-slate-400" />
                  <span>Category</span>
                </div>
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Enter or choose category"
                list="categoryList"
                className={inputClass}
              />
              <datalist id="categoryList">
                <option value="Machine Learning" />
                <option value="Artificial Intelligence" />
                <option value="Cyber Security" />
                <option value="React" />
                <option value="Node" />
                <option value="Java" />
                <option value="Computer Vision" />
                <option value="Data Structures And Algorithms" />
              </datalist>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className={labelClass}>
              <div className="flex items-center gap-1.5">
                <Info size={14} className="text-slate-400" />
                <span>Instructions</span>
              </div>
            </label>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Tell students about the test format and rules."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </div>

      {/* ── Test Visibility & Access Control ── */}
      <div className={cardClass}>
        <div className="mb-6 flex items-center gap-2">
          <Shield className="text-indigo-500" size={20} />
          <h2 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
            Test Visibility
          </h2>
        </div>

        <div className="space-y-5">
          {/* Visibility Toggle Button */}
          <div>
            <label className={labelClass}>
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-slate-400" />
                <span>Test Type</span>
              </div>
            </label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setVisibility('public')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all border-2 ${
                  visibility === 'public'
                    ? isLightMode 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-indigo-600 text-white border-indigo-600'
                    : isLightMode
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      : 'bg-slate-900 text-slate-300 border-white/10 hover:border-indigo-500/30'
                }`}
              >
                🌍 Public
              </button>
              <button
                onClick={() => setVisibility('private')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all border-2 ${
                  visibility === 'private'
                    ? isLightMode 
                      ? 'bg-amber-600 text-white border-amber-600' 
                      : 'bg-amber-600 text-white border-amber-600'
                    : isLightMode
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                      : 'bg-slate-900 text-slate-300 border-white/10 hover:border-amber-500/30'
                }`}
              >
                🔒 Private
              </button>
            </div>
            <p className={`text-xs mt-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {visibility === 'public'
                ? '✓ This test will be visible to all registered users and in the available tests list.'
                : '✓ This test will only be accessible to assigned email addresses.'}
            </p>
          </div>

          {/* Email Assignment for Private Tests */}
          {visibility === 'private' && (
            <div>
              <label className={labelClass}>
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  <span>Assign to Email Addresses</span>
                </div>
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="Enter email address"
                  className={inputClass}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && emailInput && emailInput.includes('@')) {
                      setAssignedEmails([...assignedEmails, emailInput]);
                      setEmailInput('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (emailInput && emailInput.includes('@')) {
                      setAssignedEmails([...assignedEmails, emailInput]);
                      setEmailInput('');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {assignedEmails.length > 0 && (
                <div className="space-y-2">
                  {assignedEmails.map((email, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                        isLightMode ? 'bg-indigo-50 border border-indigo-200' : 'bg-indigo-500/10 border border-indigo-500/30'
                      }`}
                    >
                      <span className={isLightMode ? 'text-indigo-700' : 'text-indigo-300'}>{email}</span>
                      <button
                        onClick={() => setAssignedEmails(assignedEmails.filter((_, i) => i !== idx))}
                        className={`text-sm font-medium ${
                          isLightMode ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Test Settings ── */}
      <div className={cardClass}>
        <div className="mb-6 flex items-center gap-2">
          <Settings className="text-indigo-500" size={20} />
          <h2 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
            Test Settings
          </h2>
        </div>

        <div className="space-y-4">
          {[
            { name: 'shuffleQuestions',  label: 'Shuffle Questions',               def: true  },
            { name: 'shuffleOptions',    label: 'Shuffle Options',                 def: true  },
            { name: 'allowReview',       label: 'Allow Review',                    def: true  },
            { name: 'showCorrectAnswers',label: 'Show Correct Answers After Submit',def: false },
          ].map(({ name, label, def }) => (
            <label key={name} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name={name}
                checked={activeTest.settings?.[name] ?? def}
                onChange={handleSettingChange}
                className="w-4 h-4 rounded cursor-pointer accent-indigo-600"
              />
              <span className={isLightMode ? 'text-slate-700' : 'text-slate-300'}>{label}</span>
            </label>
          ))}

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
            <label className={labelClass}>Passing Marks (%)</label>
            <input
              type="number"
              value={passingMarks && passingMarks >= 0 ? passingMarks : 40}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setPassingMarks(Math.max(0, isNaN(val) ? 40 : val));
              }}
              min="0"
              max="100"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Negative Marking per Wrong Answer</label>
            <input
              type="number"
              value={negativeMarking && negativeMarking >= 0 ? negativeMarking : 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setNegativeMarking(Math.max(0, isNaN(val) ? 0 : val));
              }}
              min="0"
              step="0.5"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Saving overlay */}
      <Loader isVisible={saving} message="Saving test information…" status="processing" />
    </div>
  );
};

export default TestForm;
