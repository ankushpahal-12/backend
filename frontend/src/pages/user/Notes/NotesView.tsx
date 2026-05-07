import NotesFilters from './components/NotesFilters';
import NotesGrid from './components/NotesGrid';
import type { Note, NoteTopic, NotesFilter } from './types/types';

type NotesViewProps = {
	notes: Note[];
	filters: NotesFilter;
	onFiltersChange: (filters: NotesFilter) => void;
	onTopicChange: (topic: NoteTopic | 'All') => void;
	onOpen?: (note: Note) => void;
	onOpenFullPage?: (note: Note) => void;
	onToggleFavorite?: (noteId: string) => void;
	onTogglePublic?: (noteId: string) => void;
	onCreate?: () => void;
};

const NotesView = ({
	notes,
	filters,
	onFiltersChange,
	onTopicChange,
	onOpen,
	onOpenFullPage,
	onToggleFavorite,
	onTogglePublic,
	onCreate,
}: NotesViewProps) => {
	return (
		<section className="space-y-4">
			<NotesFilters filters={filters} onChange={onFiltersChange} onTopicChange={onTopicChange} />
			<NotesGrid
				notes={notes}
				onOpen={onOpen}
				onOpenFullPage={onOpenFullPage}
				onToggleFavorite={onToggleFavorite}
				onTogglePublic={onTogglePublic}
				onCreate={onCreate}
			/>
		</section>
	);
};

export default NotesView;
