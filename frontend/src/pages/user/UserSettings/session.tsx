import { Smartphone, Trash2 } from 'lucide-react';

interface SessionType {
    _id: string;
    device?: string;
    ip?: string;
    lastUsed: string;
    isCurrent: boolean;
}

interface SessionProps {
    sessions: SessionType[];
    terminateSession: (id: string) => void;
}

const Session: React.FC<SessionProps> = ({ sessions, terminateSession }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between ml-2">
                <h4 className="text-white font-black tracking-tight">Active Neural Sessions</h4>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/10 uppercase">{sessions.length} Active</span>
            </div>
            <div className="space-y-4">
                {sessions.map((session) => (
                    <div key={session._id} className="p-6 bg-zinc-950 rounded-[2rem] border border-white/5 flex items-center justify-between group">
                        <div className="flex gap-4">
                            <div className="p-3 bg-white/5 text-zinc-400 rounded-xl group-hover:text-emerald-500 transition-colors">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h5 className="text-white font-black tracking-tight text-sm">
                                    {session.device || 'Unidentified Node'}
                                    {session.isCurrent && <span className="ml-2 text-emerald-500 text-[9px] uppercase tracking-tighter">(Current)</span>}
                                </h5>
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">IP: {session.ip || '0.0.0.0'} • Last Sync: {new Date(session.lastUsed).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {!session.isCurrent && (
                            <button
                                onClick={() => terminateSession(session._id)}
                                className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Session;
