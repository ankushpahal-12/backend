import { Check, X } from 'lucide-react';

type EditorHeaderProps = {
	title: string;
	onTitleChange: (value: string) => void;
	onSave?: () => void;
	onCancel?: () => void;
};

const EditorHeader = ({ title, onTitleChange, onSave, onCancel }: EditorHeaderProps) => {
	return (
		<div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
			<input
				value={title}
				onChange={(event) => onTitleChange(event.target.value)}
				placeholder="Enter note title..."
				className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold outline-none transition focus:border-indigo-300 focus:bg-white"
			/>
			{onSave || onCancel ? (
				<div className="flex items-center gap-2">
					{onCancel ? (
						<button onClick={onCancel} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
							<X size={15} /> Cancel
						</button>
					) : null}
					{onSave ? (
						<button onClick={onSave} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700">
							<Check size={15} /> Save Note
						</button>
					) : null}
				</div>
			) : null}
		</div>
	);
};

export default EditorHeader;
