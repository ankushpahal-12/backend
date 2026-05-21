import React, { useEffect, useState, useCallback } from 'react';
import { useTestStore } from '../store/testStore';
import { useTestMonitoring } from '../hooks/useTestSocket';
import { useThemeContext } from '../../../../context/ThemeContext';
import { TestForm } from '../components/TestForm';
import { QuestionEditor } from '../components/QuestionEditor';
import {
  CheckCircle2,
  ChevronLeft,
  AlertCircle,
  Wifi,
  WifiOff,
  Save,
  Send,
  Eye,
  BookOpen,
  Hash,
  Star,
  Loader2,
  XCircle,
  Plus,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader';

/* ─────────────────────────────────────────────────────────────
   SaveStatusChip – animated pill that reflects save state
───────────────────────────────────────────────────────────── */
type SaveState = 'saved' | 'unsaved' | 'saving' | 'error';

const SaveStatusChip: React.FC<{ state: SaveState }> = ({ state }) => {
  const map: Record<SaveState, { label: string; icon: React.ReactNode; cls: string }> = {
    saved:   { label: 'All Saved',       icon: <CheckCircle2 size={13} />, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    unsaved: { label: 'Unsaved Changes', icon: <AlertCircle  size={13} />, cls: 'bg-amber-500/15   text-amber-400   border-amber-500/30'   },
    saving:  { label: 'Saving…',         icon: <Loader2      size={13} className="animate-spin" />, cls: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
    error:   { label: 'Save Error',      icon: <XCircle      size={13} />, cls: 'bg-rose-500/15   text-rose-400    border-rose-500/30'    },
  };
  const { label, icon, cls } = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${cls}`}>
      {icon}{label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   StatBadge – bottom bar stat pill
───────────────────────────────────────────────────────────── */
const StatBadge: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-2">
    <span className={`flex items-center gap-1 text-xs font-medium ${color}`}>{icon}</span>
    <span className="text-xs text-slate-400">{label}:</span>
    <span className={`text-sm font-bold ${color}`}>{value}</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
const CreateEditTestContent: React.FC = () => {
  const { activeTest, questions, saving, error, initializeTest, loadTest, clearTest, saveTest, publishTest } = useTestStore();
  const { isConnected: connected } = useTestMonitoring();
  const { mode } = useThemeContext();
  const isLight = mode === 'light';
  const navigate  = useNavigate();
  const { testId } = useParams();
  const [hasUnsaved, setHasUnsaved] = useState(false);

  /* ── Lifecycle ── */
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasUnsaved) { e.preventDefault(); e.returnValue = ''; }
  }, [hasUnsaved]);

  useEffect(() => {
    if (testId) {
      loadTest(testId);
    } else {
      initializeTest();
    }
    
    return () => {
      clearTest();
    };
  }, [testId, loadTest, initializeTest, clearTest]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload]);

  /* ── Derived state ── */
  const totalMarks      = questions.reduce((s, q) => s + (q.marks || 0), 0);
  const isSaving        = saving;
  const saveState: SaveState = error ? 'error' : isSaving ? 'saving' : hasUnsaved ? 'unsaved' : 'saved';

  /* ── Handlers ── */
  const handleSaveDraft = async () => {
    if (!activeTest?.title)    { toast.error('Please enter a test title');         return; }
    if (questions.length === 0){ toast.error('Please add at least one question');  return; }
    try {
      const result = await saveTest();
      setHasUnsaved(false);
      toast.success('Test saved as draft');
      if (result?.id)
        navigate(`/admin/tests/edit/${result.id}`);
    } catch (err) {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handlePublish = async () => {
    if (!activeTest?.title)    { toast.error('Please enter a test title');         return; }
    if (questions.length === 0){ toast.error('Please add at least one question');  return; }
    if (totalMarks === 0)      { toast.error('Please set marks for all questions');return; }
    try {
      await saveTest();
      await publishTest();
      setHasUnsaved(false);
      toast.success('Test published successfully');
      setTimeout(() => navigate('/admin/tests'), 1000);
    } catch (err) {
      toast.error(`Failed to publish: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handlePreview = () => {
    if (!activeTest?.title) { toast.error('Please enter a test title first'); return; }
    toast('Preview functionality coming soon');
  };

  /* ── Loading state ── */
  if (!activeTest) {
    return (
      <div className={`flex h-full items-center justify-center ${isLight ? 'bg-slate-50' : 'bg-slate-950'}`}>
        <Loader isVisible message="Loading editor…" status="loading" />
      </div>
    );
  }

  /* ── Theme tokens ── */
  const bg        = isLight ? 'bg-white'       : 'bg-[#0d1117]';
  const border    = isLight ? 'border-slate-200': 'border-white/[0.07]';
  const headerBg  = isLight ? 'bg-white/90'    : 'bg-[#0d1117]/90';
  const footerBg  = isLight ? 'bg-white/95'    : 'bg-[#0d1117]/95';
  const panelBg   = isLight ? 'bg-slate-50'    : 'bg-slate-900/50';
  const textPrimary = isLight ? 'text-slate-900' : 'text-white';
  const textMuted   = isLight ? 'text-slate-500' : 'text-slate-400';
  const linkCls     = isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300';

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] ${bg}`}>

      {/* ── Sticky Header ────────────────────────────────────────── */}
      <header
        className={`
          sticky top-0 z-20 flex items-center justify-between
          px-6 py-3.5 border-b backdrop-blur-xl
          ${headerBg} ${border}
        `}
      >
        {/* Left: back + breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tests"
            className={`
              flex items-center justify-center w-8 h-8 rounded-lg transition-colors
              ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/8 text-slate-400'}
            `}
          >
            <ChevronLeft size={18} />
          </Link>

          {/* Divider */}
          <span className={`h-5 w-px ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />

          <div>
            <h1 className={`text-base font-bold leading-tight ${textPrimary}`}>
              {testId ? 'Edit Test' : 'Create Test'}
            </h1>
            <nav className="flex items-center gap-1.5 text-xs mt-0.5">
              <Link to="/admin/dashboard" className={linkCls}>Dashboard</Link>
              <span className={textMuted}>/</span>
              <Link to="/admin/tests" className={linkCls}>Tests</Link>
              <span className={textMuted}>/</span>
              <span className={textMuted}>{testId ? 'Edit' : 'New'}</span>
            </nav>
          </div>
        </div>

        {/* Right: status badges */}
        <div className="flex items-center gap-2">
          {/* Connection dot */}
          <span
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
              ${connected
                ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : isLight ? 'bg-amber-50   text-amber-700   border-amber-200'   : 'bg-amber-500/10   text-amber-400   border-amber-500/20'
              }
            `}
          >
            {connected
              ? <Wifi    size={11} className="shrink-0" />
              : <WifiOff size={11} className="shrink-0" />
            }
            {connected ? 'Live' : 'Offline'}
          </span>

          {/* Save state chip */}
          <SaveStatusChip state={saveState} />
        </div>
      </header>

      {/* ── Error Banner ─────────────────────────────────────────── */}
      {error && (
        <div
          className={`
            flex items-center gap-3 px-6 py-2.5 border-b text-sm
            ${isLight
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}
          `}
        >
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-0">

        {/* Left panel – Test form */}
        <aside
          className={`
            w-full md:w-[380px] shrink-0 overflow-y-auto
            border-r pb-28 ${panelBg} ${border}
          `}
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={15} className="text-indigo-400" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                Test Details
              </span>
            </div>
            <TestForm />
          </div>
        </aside>

        {/* Right panel – Question editor */}
        <main
          className="flex-1 overflow-y-auto pb-28 relative"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Hash size={15} className="text-violet-400" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                Questions
              </span>
            </div>
            <QuestionEditor />
          </div>

          {/* Floating Add Question Button */}
          <button
            onClick={() => {
              const { addQuestion } = useTestStore.getState();
              addQuestion();
              setHasUnsaved(true);
            }}
            className={`
              fixed bottom-32 right-6
              flex items-center gap-2 px-5 py-3 rounded-full
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              text-sm font-bold text-white
              shadow-lg shadow-indigo-600/40
              transition-all duration-200 
              hover:scale-105 active:scale-95
              z-30
            `}
            title="Add a new question"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Question</span>
          </button>
        </main>
      </div>

      {/* ── Sticky Footer Action Bar ──────────────────────────────── */}
      <footer
        className={`
          fixed bottom-0 left-0 right-0 md:left-[var(--sidebar-width,0px)]
          z-20 border-t backdrop-blur-xl
          flex items-center justify-between px-6 py-3.5
          ${footerBg} ${border}
        `}
      >
        {/* Stats */}
        <div className="flex items-center gap-5">
          <StatBadge
            icon={<Hash size={12} />}
            label="Questions"
            value={questions.length}
            color="text-violet-400"
          />
          <span className={`h-4 w-px ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
          <StatBadge
            icon={<Star size={12} />}
            label="Total Marks"
            value={totalMarks}
            color="text-amber-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Preview */}
          <button
            onClick={handlePreview}
            disabled={isSaving}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg
              text-xs font-semibold border transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed
              ${isLight
                ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                : 'border-white/10 text-slate-300 hover:bg-white/5'}
            `}
          >
            <Eye size={13} />
            Preview
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg
              text-xs font-semibold border transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed
              ${isLight
                ? 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                : 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10'}
            `}
          >
            <Save size={13} />
            Save Draft
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="
              inline-flex items-center gap-2 px-5 py-2 rounded-lg
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              text-xs font-bold text-white shadow-lg shadow-indigo-600/25
              transition-all duration-150 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {isSaving
              ? <Loader2 size={13} className="animate-spin" />
              : <Send    size={13} />
            }
            {isSaving ? 'Publishing…' : 'Publish Test'}
          </button>
        </div>
      </footer>

      {/* ── Save overlay ─────────────────────────────────────────── */}
      <Loader isVisible={isSaving} message="Saving test…" status="processing" />
    </div>
  );
};

export const CreateEditTestPage: React.FC = () => <CreateEditTestContent />;
