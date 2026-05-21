import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supportAdminService } from '../services/supportAdmin.service';
import type { AdminTicket, TicketStatus } from '../types/supportAdmin.types';
import { ArrowLeft } from 'lucide-react';
import { TicketDetailsDrawer } from '../components/support/TicketDetailsDrawer';
import { LogModal } from '../components/support/LogModal';
import { ApiInspectorModal } from '../components/support/ApiInspectorModal';
import { ScreenshotModal } from '../components/support/ScreenshotModal';
import { TimeDetailModal } from '../components/support/TimeDetailModal';

export const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<AdminTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await supportAdminService.getTicketById(`#${id}`);
        setTicket(data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Ticket Not Found</h2>
        <p className="text-slate-500 mb-6">The ticket you are looking for does not exist or you don't have access.</p>
        <Link to="/admin/support/tickets" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors">
          Back to Support Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 shrink-0 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Link to="/admin/support/tickets" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Deep Debugging View</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">Ticket {ticket.id} • Full Screen Analysis</p>
          </div>
        </div>
      </header>

      {/* Main Content Area - We reuse the drawer but make it always open and fill the screen conceptually.
          Since the Drawer is fixed position and `inset-y-0 right-0 w-full max-w-3xl`, we will just render the drawer
          but override its styling, or we just render it open without backdrop. 
          Actually, we can just let it be open covering the screen or build a custom layout.
          For the sake of this prototype, we'll mount the Drawer but since it is fixed, it will act as an overlay.
          Let's wrap it nicely so it feels like a page.
      */}
      <div className="flex-1 p-8 overflow-auto flex justify-center">
        <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)] relative">
          <TicketDetailsDrawer 
            isEmbedded={true}
            isOpen={true}
            onClose={() => {}} // No close button needed here, but X will just do nothing
            ticket={ticket}
            onStatusChange={async (id, status) => {
              await supportAdminService.updateTicketStatus(id, status);
              const t = await supportAdminService.getTicketById(id);
              setTicket(t || null);
            }}
            onSendReply={async (id, message) => {
              await supportAdminService.addReply(id, message);
              const t = await supportAdminService.getTicketById(id);
              setTicket(t || null);
            }}
            openLogModal={() => setIsLogModalOpen(true)}
            openApiModal={() => setIsApiModalOpen(true)}
            openScreenshotModal={() => setIsScreenshotModalOpen(true)}
            openTimelineModal={() => setIsTimelineModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <LogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} logs={ticket.logs} />
      <ApiInspectorModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} failures={ticket.apiFailures} />
      <ScreenshotModal isOpen={isScreenshotModalOpen} onClose={() => setIsScreenshotModalOpen(false)} imageUrl={ticket.screenshotUrl || ''} />
      <TimeDetailModal isOpen={isTimelineModalOpen} onClose={() => setIsTimelineModalOpen(false)} timeline={ticket.timeline} />
    </div>
  );
};

export default TicketDetailsPage;
