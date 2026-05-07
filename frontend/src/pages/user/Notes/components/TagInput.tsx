import { X } from 'lucide-react';
import { useState } from 'react';

type TagInputProps = {
	tags: string[];
	onAddTag: (tag: string) => void;
	onRemoveTag: (tag: string) => void;
	placeholder?: string;
};

const TagInput = ({ tags, onAddTag, onRemoveTag, placeholder = 'Add tags...' }: TagInputProps) => {
	const [value, setValue] = useState('');

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-3">
			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<span key={tag} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
						{tag}
						<button type="button" onClick={() => onRemoveTag(tag)} aria-label={`Remove ${tag}`}>
							<X size={12} />
						</button>
					</span>
				))}
				<input
					value={value}
					onChange={(event) => setValue(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter' || event.key === ',') {
							event.preventDefault();
							onAddTag(value);
							setValue('');
						}
					}}
					placeholder={placeholder}
					className="min-w-40 flex-1 border-none bg-transparent px-1 py-1 text-sm outline-none"
				/>
			</div>
		</div>
	);
};

export default TagInput;
