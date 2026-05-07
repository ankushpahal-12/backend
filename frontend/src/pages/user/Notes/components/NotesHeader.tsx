import { Clock3, Sparkles, Save } from 'lucide-react';

type NotesHeaderProps = {
	title: string;
	subtitle: string;
	autosavedLabel?: string;
	onNewNote?: () => void;
};

const NotesHeader = ({ title, subtitle, autosavedLabel = 'Autosaved just now', onNewNote }: NotesHeaderProps) => {
	return (
		<header className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
						<Sparkles size={13} /> Notes workspace
					</div>
					<h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">{title}</h1>
					<p className="mt-1 text-sm text-slate-500">{subtitle}</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
						<Save size={15} /> {autosavedLabel}
					</div>
					<button
						onClick={onNewNote}
						className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
					>
						<Clock3 size={15} /> New Note
					</button>
				</div>
			</div>
		</header>
	);
};

export default NotesHeader;
