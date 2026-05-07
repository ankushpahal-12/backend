import EmptyState from './EmptyState';
import NotesCard from './NotesCard';
import type { Note } from '../types/types';

type NotesGridProps = {
	notes: Note[];
	onOpen?: (note: Note) => void;
	onOpenFullPage?: (note: Note) => void;
	onToggleFavorite?: (noteId: string) => void;
	onTogglePublic?: (noteId: string) => void;
	onCreate?: () => void;
};

const NotesGrid = ({ notes, onOpen, onOpenFullPage, onToggleFavorite, onTogglePublic, onCreate }: NotesGridProps) => {
	if (notes.length === 0) {
		return <EmptyState onCreate={onCreate} />;
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{notes.map((note) => (
				<NotesCard
					key={note.id}
					note={note}
					onOpen={onOpen}
					onOpenFullPage={onOpenFullPage}
					onToggleFavorite={onToggleFavorite}
					onTogglePublic={onTogglePublic}
				/>
			))}
		</div>
	);
};

export default NotesGrid;
