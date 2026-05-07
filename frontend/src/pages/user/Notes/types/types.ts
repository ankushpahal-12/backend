export type NoteTopic = 'Biology' | 'Chemistry' | 'Physics' | 'Maths';

export type NoteBackground = 'default' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

export type NoteTag = string;

export type Note = {
	id: string;
	title: string;
	content: string;
	topic: NoteTopic;
	subtopic?: string;
	tags: NoteTag[];
	isFavorite: boolean;
	isPublic: boolean;
	background: NoteBackground;
	updatedAt: string;
	createdAt: string;
};

export type NotesFilter = {
	search: string;
	topic: NoteTopic | 'All';
	favoritesOnly: boolean;
};

export type NoteEditorDraft = {
	title: string;
	content: string;
	topic: NoteTopic;
	subtopic: string;
	tags: NoteTag[];
	isFavorite: boolean;
	isPublic: boolean;
	background: NoteBackground;
};

export type NoteCardProps = {
	note: Note;
	onOpen?: (note: Note) => void;
	onOpenFullPage?: (note: Note) => void;
	onToggleFavorite?: (noteId: string) => void;
	onTogglePublic?: (noteId: string) => void;
};
