import { PlusCircle } from 'lucide-react';

type EmptyStateProps = {
	title?: string;
	description?: string;
	onCreate?: () => void;
};

const EmptyState = ({
	title = 'No notes found',
	description = 'Try a different search or create a new note.',
	onCreate,
}: EmptyStateProps) => {
	return (
		<div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
			<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
				<PlusCircle size={24} />
			</div>
			<h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
			<p className="mt-1 text-sm text-slate-500">{description}</p>
			{onCreate ? (
				<button
					onClick={onCreate}
					className="mt-5 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
				>
					Create Note
				</button>
			) : null}
		</div>
	);
};

export default EmptyState;
