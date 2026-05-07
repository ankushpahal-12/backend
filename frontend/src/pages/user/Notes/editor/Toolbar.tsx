import type { LucideIcon } from 'lucide-react';

type ToolbarItem = {
	icon: LucideIcon;
	label: string;
};

type ToolbarProps = {
	items: ToolbarItem[];
};

const Toolbar = ({ items }: ToolbarProps) => {
	return (
		<div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/80 p-3">
			{items.map(({ icon: Icon, label }) => (
				<button key={label} type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" title={label} aria-label={label}>
					<Icon size={15} />
				</button>
			))}
			<div className="ml-auto rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">AI Assist</div>
		</div>
	);
};

export default Toolbar;
