import { Bold, Italic, Link, List, ListOrdered, Quote, Underline } from 'lucide-react';
import Toolbar from './Toolbar';

type EditorAreaProps = {
	content: string;
	onChange: (value: string) => void;
};

const EditorArea = ({ content, onChange }: EditorAreaProps) => {
	return (
		<div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
			<Toolbar
				items={[
					{ icon: Bold, label: 'Bold' },
					{ icon: Italic, label: 'Italic' },
					{ icon: Underline, label: 'Underline' },
					{ icon: ListOrdered, label: 'Numbered list' },
					{ icon: List, label: 'Bullet list' },
					{ icon: Quote, label: 'Quote' },
					{ icon: Link, label: 'Link' },
				]}
			/>
			<textarea
				value={content}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Write your note here..."
				className="min-h-[520px] w-full resize-none rounded-b-3xl border-0 bg-transparent p-5 text-sm leading-7 text-slate-800 outline-none"
			/>
		</div>
	);
};

export default EditorArea;
