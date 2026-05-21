import React, { useState, useEffect } from 'react';
import { useQuestions } from '../hooks/useQuestions';
import { useTestStore } from '../store/testStore';
import { useThemeContext } from '../../../../context/ThemeContext';
import { Plus, Trash2, Copy, Check, X } from 'lucide-react';
import { generateId } from '../utils/testHelpers';
import toast from 'react-hot-toast';
import type { QuestionOption } from '../hooks/useTests';

export const QuestionEditor: React.FC = () => {
  const { questions, addQuestion, updateQuestion, removeQuestion, duplicateQuestion } = useQuestions();
  const { saving, error } = useTestStore();
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  const [, setLastUpdatedId] = useState<string | null>(null);

  // Show error toast if save fails
  useEffect(() => {
    if (error) {
      toast.error(`Failed to save: ${error}`);
    }
  }, [error]);

  const handleAddOption = (qId: string, currentOptions: QuestionOption[]) => {
    updateQuestion(qId, {
      options: [...currentOptions, { id: generateId(), text: '' }]
    });
    setLastUpdatedId(qId);
    toast.success('Option added');
  };

  const handleRemoveOption = (qId: string, currentOptions: QuestionOption[], optId: string) => {
    if (currentOptions.length <= 2) return;
    updateQuestion(qId, {
      options: currentOptions.filter((o: QuestionOption) => o.id !== optId)
    });
    setLastUpdatedId(qId);
    toast.success('Option removed');
  };

  const handleOptionTextChange = (qId: string, currentOptions: QuestionOption[], optId: string, text: string) => {
    updateQuestion(qId, {
      options: currentOptions.map((o: QuestionOption) => o.id === optId ? { ...o, text } : o)
    });
    setLastUpdatedId(qId);
  };

  const toggleCorrectAnswer = (qId: string, optId: string, currentCorrect: string[], allowMultiple: boolean) => {
    let newCorrect: string[];
    if (allowMultiple) {
      if (currentCorrect.includes(optId)) {
        newCorrect = currentCorrect.filter(id => id !== optId);
      } else {
        newCorrect = [...currentCorrect, optId];
      }
    } else {
      newCorrect = [optId];
    }
    updateQuestion(qId, { correctAnswers: newCorrect });
    setLastUpdatedId(qId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
          Questions ({questions.length})
          {saving && <span className="ml-3 text-xs text-indigo-500">Saving...</span>}
        </h2>
        <button
          onClick={() => addQuestion()}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className={`relative rounded-2xl border p-6 transition-all ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-white/10 shadow-lg shadow-black/20'
            }`}
          >
            {/* Header Actions */}
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <button
                onClick={() => {
                  duplicateQuestion(q.id);
                  setLastUpdatedId(q.id);
                  toast.success('Question duplicated');
                }}
                disabled={saving}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLightMode ? 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50' : 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'
                }`}
                title="Duplicate Question"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={() => {
                  removeQuestion(q.id);
                  setLastUpdatedId(null);
                  toast.success('Question deleted');
                }}
                disabled={saving}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLightMode ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                }`}
                title="Delete Question"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Question Text & Marks */}
            <div className="flex gap-4 mb-6 pr-24">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold ${
                isLightMode ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className={`mb-1 block text-sm font-semibold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    Question <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={q.text}
                    onChange={(e) => {
                      updateQuestion(q.id, { text: e.target.value });
                      setLastUpdatedId(q.id);
                    }}
                    disabled={saving}
                    className={`w-full rounded-xl border px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      isLightMode ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-white/10 text-white'
                    }`}
                    rows={2}
                    placeholder="Type your question here..."
                  />
                </div>
              </div>
              <div className="w-24 shrink-0">
                <label className={`mb-1 block text-sm font-semibold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                  Marks <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={q.marks && q.marks > 0 ? q.marks : 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    updateQuestion(q.id, { marks: Math.max(1, isNaN(val) ? 1 : val) });
                    setLastUpdatedId(q.id);
                  }}
                  disabled={saving}
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none transition-colors text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLightMode ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-white/10 text-white'
                  }`}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 ml-12">
              {/* Options List */}
              <div className="lg:col-span-7 space-y-3">
                <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                  Options
                </label>
                {q.options.map((opt, optIndex) => {
                  const isCorrect = q.correctAnswers.includes(opt.id);
                  const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C...

                  return (
                    <div key={opt.id} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCorrectAnswer(q.id, opt.id, q.correctAnswers, q.allowMultiple)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          q.allowMultiple ? 'rounded-md' : 'rounded-full'
                        } ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : isLightMode
                              ? 'border-slate-300 hover:border-emerald-500'
                              : 'border-slate-600 hover:border-emerald-500'
                        }`}
                      >
                        {isCorrect && <Check size={14} strokeWidth={3} />}
                      </button>

                      <div className="relative flex-1">
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${
                          isLightMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {optionLabel}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            handleOptionTextChange(q.id, q.options, opt.id, e.target.value);
                          }}
                          disabled={saving}
                          className={`w-full rounded-xl border py-2.5 pl-10 pr-10 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            isCorrect
                              ? isLightMode ? 'border-emerald-500 bg-emerald-50/50' : 'border-emerald-500/50 bg-emerald-500/10'
                              : isLightMode ? 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white' : 'border-white/10 bg-slate-950 focus:border-indigo-500'
                          } ${isLightMode ? 'text-slate-900' : 'text-white'}`}
                          placeholder={`Option ${optionLabel}`}
                        />
                        {q.options.length > 2 && (
                          <button
                            onClick={() => handleRemoveOption(q.id, q.options, opt.id)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => handleAddOption(q.id, q.options)}
                  disabled={saving}
                  className={`mt-2 text-sm font-bold flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLightMode ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'
                  }`}
                >
                  <Plus size={16} /> Add another option
                </button>
              </div>

              {/* Correct Answers Settings */}
              <div className="lg:col-span-5 space-y-6">
                <div className={`p-4 rounded-xl border ${
                  isLightMode
                    ? q.allowMultiple ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200 bg-slate-50'
                    : q.allowMultiple ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/5'
                }`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className={`block font-bold text-sm ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                        Allow Multiple Correct Answers
                      </span>
                      <span className={`block text-xs mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {q.allowMultiple ? 'When ON: Two or more options can be correct' : 'When OFF: Only one option can be correct'}
                      </span>
                    </div>
                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                         style={{ backgroundColor: q.allowMultiple ? '#10b981' : isLightMode ? '#cbd5e1' : '#475569' }}
                         onClick={() => {
                           if (!saving) {
                             const updates: any = { allowMultiple: !q.allowMultiple };
                             if (q.allowMultiple && q.correctAnswers.length > 1) {
                               updates.correctAnswers = [q.correctAnswers[0]];
                             }
                             updateQuestion(q.id, updates);
                             setLastUpdatedId(q.id);
                           }
                         }}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${q.allowMultiple ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                  </label>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    Correct Answer{q.allowMultiple ? 's' : ''} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {q.correctAnswers.length > 0 ? (
                      q.correctAnswers.map((ansId: string) => {
                        const opt = q.options.find((o: QuestionOption) => o.id === ansId);
                        const optIndex = q.options.findIndex((o: QuestionOption) => o.id === ansId);
                        const optionLabel = String.fromCharCode(65 + optIndex);
                        return (
                          <div key={ansId} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
                            isLightMode ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                          }`}>
                            <span className="font-bold opacity-70">{optionLabel}</span>
                            <span className="max-w-[120px] truncate">{opt?.text || 'Empty Option'}</span>
                            {q.allowMultiple && (
                              <button onClick={() => toggleCorrectAnswer(q.id, ansId, q.correctAnswers, q.allowMultiple)} className="ml-1 opacity-70 hover:opacity-100">
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span className={`text-sm italic ${isLightMode ? 'text-rose-500' : 'text-rose-400'}`}>
                        Please select a correct answer from options
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${
            isLightMode ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'
          }`}>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
              isLightMode ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              <Plus size={24} />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>No questions yet</h3>
            <p className={`text-sm mb-6 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Start building your test by adding questions.
            </p>
            <button
              onClick={() => addQuestion()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Add First Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
