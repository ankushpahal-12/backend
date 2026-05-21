import React from 'react';
import { Search, Filter, MessageSquare, AlertCircle, Clock, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AdminTicket, TicketStatus, TicketPriority } from '../../types/supportAdmin.types';
import { formatDate } from '../../utils/logFormatter';

interface TicketsTableProps {
  tickets: AdminTicket[];
  stats: { total: number; open: number; inProgress: number; resolved: number };
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  onRowClick: (id: string) => void;
  selectedTicketId: string | null;
}

export const TicketsTable: React.FC<TicketsTableProps> = ({
  tickets, stats, searchQuery, setSearchQuery, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, onRowClick, selectedTicketId
}) => {

  const renderStatusBadge = (status: TicketStatus) => {
    const styles = {
      'Open': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
      'Resolved': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Closed': 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${styles[status]}`}>{status}</span>;
  };

  const renderPriorityBadge = (priority: TicketPriority) => {
    const styles = {
      'High': 'text-rose-600 bg-rose-50 border border-rose-100',
      'Critical': 'text-rose-700 bg-rose-100 border border-rose-200',
      'Medium': 'text-amber-600 bg-amber-50 border border-amber-100',
      'Low': 'text-emerald-600 bg-emerald-50 border border-emerald-100'
    };
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${styles[priority]}`}>{priority}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 shrink-0">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-inner">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tickets</p>
            <p className="text-2xl font-black text-slate-900 leading-none">{stats.total}</p>
            <p className="text-[10px] font-semibold text-slate-500 mt-1">All time</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-inner">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Open</p>
            <p className="text-2xl font-black text-slate-900 leading-none">{stats.open}</p>
            <p className="text-[10px] font-semibold text-slate-500 mt-1">Requires attention</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-inner">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">In Progress</p>
            <p className="text-2xl font-black text-slate-900 leading-none">{stats.inProgress}</p>
            <p className="text-[10px] font-semibold text-slate-500 mt-1">Being worked on</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-inner">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Resolved</p>
            <p className="text-2xl font-black text-slate-900 leading-none">{stats.resolved}</p>
            <p className="text-[10px] font-semibold text-slate-500 mt-1">Completed</p>
          </div>
        </div>
      </div>

      {/* Filters & Table Wrapper */}
      <div className="flex-1 flex flex-col px-6 pb-6 overflow-hidden">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl flex-1 flex flex-col overflow-hidden">
          
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="relative w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by user, subject or ID..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none pr-10 relative"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}
              >
                <option value="All Status">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select 
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none pr-10"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}
              >
                <option value="All Priority">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-colors">
                <Filter size={16} /> Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm shadow-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">User</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Issue Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Priority</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map(ticket => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => onRowClick(ticket.id)}
                    className={`
                      cursor-pointer transition-colors group border-l-4
                      ${selectedTicketId === ticket.id ? 'bg-indigo-50 border-l-indigo-500' : 'bg-white hover:bg-slate-50 border-l-transparent'}
                    `}
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{ticket.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={ticket.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.user.name)}&background=random`} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm" />
                        <span className="text-sm font-bold text-slate-800">{ticket.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700 max-w-xs truncate">{ticket.subject}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-indigo-500">{ticket.issueType}</span>
                    </td>
                    <td className="px-6 py-4">
                      {renderPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{formatDate(ticket.createdAt).split(',')[0]}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{formatDate(ticket.createdAt).split(',')[1]}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                      No tickets found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Showing 1 to {Math.min(10, tickets.length)} of {tickets.length} tickets
            </span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors">2</button>
              <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
