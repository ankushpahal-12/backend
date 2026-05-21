import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquarePlus, Ticket } from 'lucide-react';
import { useSupportWidget } from '../hooks/useSupportWidget';
import { useSupportWidgetContext } from '../context/SupportWidgetContext';
import { SuccessMessage } from './SuccessMessage';
import { CreateTicketInChat } from './CreateTicketInChat';
import { TicketList } from './TicketList';
import { TicketDetail } from './TicketDetail';
import { ChatView } from './ChatView';

export const HelpPanel: React.FC = () => {
  const { isOpen, currentView, navigateBack, navigateTo } = useSupportWidget();
  const { userName, isLoadingConversation } = useSupportWidgetContext();

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'chat': return 'Support Chat';
      case 'form': return 'Create a Ticket';
      case 'list': return 'My Tickets';
      case 'detail': return 'Ticket Details';
      case 'success': return '';
      default: return 'Help & Support';
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'chat':
        return <ChatView key="chat" />;
      case 'form':
        return <CreateTicketInChat key="form" />;
      case 'list':
        return <TicketList key="list" />;
      case 'detail':
        return <TicketDetail key="detail" />;
      case 'success':
        return <SuccessMessage key="success" />;
      case 'home':
      default:
        return (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-3 p-5"
          >
            {/* Chat card */}
            <button
              onClick={() => navigateTo('chat')}
              className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group text-left"
            >
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <MessageSquarePlus size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
                  Chat with Support
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Talk to our team in real-time. Get instant help.
                </p>
              </div>
            </button>

            {/* Create ticket card */}
            <button
              onClick={() => navigateTo('form')}
              className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all group text-left"
            >
              <div className="bg-violet-50 text-violet-600 p-3 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <Ticket size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-violet-600 transition-colors">
                  Create a Ticket
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Submit a detailed report with screenshots and session logs.
                </p>
              </div>
            </button>

            {/* My tickets */}
            <button
              onClick={() => navigateTo('list')}
              className="w-full py-3 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              View My Tickets
            </button>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-24 right-6 z-[9998] w-[400px] h-[650px] max-h-[80vh] max-w-[calc(100vw-48px)] bg-slate-50 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col border border-slate-200/60"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 pt-7 pb-9 relative shrink-0">
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute top-20 -left-10 w-32 h-32 bg-indigo-400 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentView !== 'home' && currentView !== 'success' && (
                  <button
                    onClick={navigateBack}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    {getHeaderTitle()}
                  </h2>
                  {currentView === 'home' && (
                    <p className="text-indigo-200 text-xs mt-0.5">Hi {userName} 👋 How can we help?</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden relative bg-slate-50 -mt-6 rounded-t-3xl">
            {isLoadingConversation ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin border-[3px]" />
                  <p className="text-xs text-slate-500">Loading…</p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 p-3 text-center border-t border-slate-200/60 bg-white">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Your data is secure with us
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
