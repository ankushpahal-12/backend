import React, { useState } from 'react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { Lock, Shield, Settings2, Clock, Calendar, CheckSquare, Save } from 'lucide-react';
import Loader from '../../../admin/components/ui/NetworkLoader';
import { updateTest } from '../services/testApi';
import toast from 'react-hot-toast';
import type { Test } from '../types/test.types';

interface TestSettingsTabProps {
  test: Test;
  onRefresh: () => void;
}

export const TestSettingsTab: React.FC<TestSettingsTabProps> = ({ test, onRefresh }) => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateSetting = async (field: string, value: boolean) => {
    setIsLoading(true);
    try {
      const updatedSettings = {
        ...test.settings,
        [field]: value
      };
      await updateTest(test.id, { settings: updatedSettings });
      toast.success('Setting updated');
      onRefresh();
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRoot = async (field: string, value: unknown) => {
    setIsLoading(true);
    try {
      await updateTest(test.id, { [field]: value });
      toast.success('Test updated');
      onRefresh();
    } catch {
      toast.error('Failed to update test');
    } finally {
      setIsLoading(false);
    }
  };

  const settings = test?.settings || {};

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      {isLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Loader message="Updating settings..." />
        </div>
      )}
      {/* Left Column: Settings Form */}
      <div className="flex-1 space-y-6">
        <div>
          <h3 className={`text-lg font-bold mb-1 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Test Settings</h3>
          <p className={`text-sm mb-6 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Configure how this test behaves for candidates.</p>
        </div>

        {/* Access & Availability */}
        <div className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isLightMode ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
              <Lock size={20} />
            </div>
            <h4 className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Access & Availability</h4>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>Published</p>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Make this test visible to assigned users.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={test?.status === 'published'} 
                  onChange={(e) => handleUpdateRoot('status', e.target.checked ? 'published' : 'draft')} 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className={`ml-3 text-sm font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>{test?.status === 'published' ? 'Yes' : 'No'}</span>
              </label>
            </div>

            <div className={`border-t ${isLightMode ? 'border-slate-100' : 'border-white/10'}`}></div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>Published Access</p>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Select who can access this test.</p>
              </div>
              <select 
                value={test?.publishedAccess || 'All Assigned Users'}
                onChange={(e) => handleUpdateRoot('publishedAccess', e.target.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm outline-none cursor-pointer transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700'}`}
              >
                <option value="All Assigned Users">All Assigned Users</option>
                <option value="Public">Public</option>
              </select>
            </div>
            
            <div className={`border-t ${isLightMode ? 'border-slate-100' : 'border-white/10'}`}></div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
              <div className="flex-1">
                <p className={`font-semibold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>Start Date & Time</p>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>When the test becomes available.</p>
              </div>
              <input 
                type="datetime-local" 
                value={test?.startAt ? new Date(test.startAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleUpdateRoot('startAt', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className={`rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' : 'bg-slate-800 border-white/10 text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
              <div className="flex-1">
                <p className={`font-semibold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>End Date & Time</p>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>When the test closes.</p>
              </div>
              <input 
                type="datetime-local" 
                value={test?.endAt ? new Date(test.endAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleUpdateRoot('endAt', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className={`rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' : 'bg-slate-800 border-white/10 text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
              />
            </div>
          </div>
        </div>

        {/* Test Behavior */}
        <div className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isLightMode ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
              <Shield size={20} />
            </div>
            <h4 className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Test Behavior</h4>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>Allow Retest</p>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Allow users to retake the test.</p>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed opacity-50" title="This setting is configured on a per-user basis in the Attempts tab.">
                <input type="checkbox" className="sr-only peer" checked={false} readOnly disabled />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className={`ml-3 text-sm font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>No</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>Show Results Instantly</p>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Show results to users right after submission.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.showResultsImmediately !== false} 
                  onChange={(e) => handleUpdateSetting('showResultsImmediately', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className={`ml-3 text-sm font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>{settings.showResultsImmediately !== false ? 'Yes' : 'No'}</span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>Show Correct Answers</p>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Show correct answers along with results.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.showCorrectAnswers || false} 
                  onChange={(e) => handleUpdateSetting('showCorrectAnswers', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className={`ml-3 text-sm font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>{settings.showCorrectAnswers ? 'Yes' : 'No'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Question & Option Settings */}
        <div className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isLightMode ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Settings2 size={20} />
            </div>
            <h4 className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Question & Option Settings</h4>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>Shuffle Questions</p>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Randomize the order of questions for each user.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.shuffleQuestions !== false} 
                  onChange={(e) => handleUpdateSetting('shuffleQuestions', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className={`ml-3 text-sm font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>{settings.shuffleQuestions !== false ? 'Yes' : 'No'}</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>Shuffle Options</p>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Randomize the order of options for each question.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.shuffleOptions !== false} 
                  onChange={(e) => handleUpdateSetting('shuffleOptions', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className={`ml-3 text-sm font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>{settings.shuffleOptions !== false ? 'Yes' : 'No'}</span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>One Question Per Page</p>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Show one question at a time.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.oneQuestionPerPage || false} 
                  onChange={(e) => handleUpdateSetting('oneQuestionPerPage', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className={`ml-3 text-sm font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>{settings.oneQuestionPerPage ? 'Yes' : 'No'}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Test Preview */}
      <div className="w-full lg:w-80 shrink-0">
        <div className={`sticky top-6 p-6 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-white/10'}`}>
          <h3 className={`font-bold mb-1 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Test Preview</h3>
          <p className={`text-xs mb-6 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>This is how the test will appear to candidates.</p>

          <div className="space-y-3">
            <div className={`p-4 rounded-xl flex items-start gap-3 ${isLightMode ? 'bg-white border border-slate-100' : 'bg-slate-800/50 border border-white/5'}`}>
              <div className={`p-1.5 rounded-md ${isLightMode ? 'bg-indigo-50 text-indigo-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                <Calendar size={16} />
              </div>
              <div>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>Schedule</p>
                <p className={`text-xs font-medium mt-0.5 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                  {test?.startAt ? new Date(test.startAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Always Open'}
                  {' - '}
                  {test?.endAt ? new Date(test.endAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'No Limit'}
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-start gap-3 ${isLightMode ? 'bg-white border border-slate-100' : 'bg-slate-800/50 border border-white/5'}`}>
              <div className={`p-1.5 rounded-md ${isLightMode ? 'bg-emerald-50 text-emerald-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
                <Clock size={16} />
              </div>
              <div>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>Duration</p>
                <p className={`text-xs font-medium mt-0.5 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{test?.durationMinutes} Minutes</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-start gap-3 ${isLightMode ? 'bg-white border border-slate-100' : 'bg-slate-800/50 border border-white/5'}`}>
              <div className={`p-1.5 rounded-md ${isLightMode ? 'bg-amber-50 text-amber-500' : 'bg-amber-500/20 text-amber-400'}`}>
                <CheckSquare size={16} />
              </div>
              <div>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>Questions</p>
                <p className={`text-xs font-medium mt-0.5 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{test?.questions?.length || 0} Total</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-start gap-3 ${isLightMode ? 'bg-white border border-slate-100' : 'bg-slate-800/50 border border-white/5'}`}>
              <div className={`p-1.5 rounded-md ${isLightMode ? 'bg-blue-50 text-blue-500' : 'bg-blue-500/20 text-blue-400'}`}>
                <Save size={16} />
              </div>
              <div>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>Auto Submit</p>
                <p className={`text-xs font-medium mt-0.5 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>On time expiry</p>
              </div>
            </div>
          </div>

          <div className={`mt-6 p-3 flex gap-2 rounded-lg text-xs ${isLightMode ? 'bg-blue-50 text-blue-700' : 'bg-blue-500/10 text-blue-400'}`}>
            <span className="font-bold shrink-0">Note:</span>
            <span>These settings apply to all assigned candidates. Go to Edit Test to change them.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
