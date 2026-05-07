import EditorHeader from './editor/EditorHeader';
import EditorArea from './editor/EditorArea';
import MetadataPanel from './editor/MetadataPanel';
import type { NoteBackground, NoteEditorDraft, NoteTopic } from './types/types';

type NotesEditorProps = {
	draft: NoteEditorDraft;
	onTitleChange: (value: string) => void;
	onContentChange: (value: string) => void;
	onTopicChange: (topic: NoteTopic) => void;
	onSubtopicChange: (value: string) => void;
	onBackgroundChange: (background: NoteBackground) => void;
	onToggleFavorite: () => void;
	onTogglePublic: () => void;
	onAddTag: (tag: string) => void;
	onRemoveTag: (tag: string) => void;
	onSave?: () => void;
	onCancel?: () => void;
};

const NotesEditor = ({
	draft,
	onTitleChange,
	onContentChange,
	onTopicChange,
	onSubtopicChange,
	onBackgroundChange,
	onToggleFavorite,
	onTogglePublic,
	onAddTag,
	onRemoveTag,
	onSave,
	onCancel,
}: NotesEditorProps) => {
	return (
		<div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-stretch">
			<div className="space-y-4">
				<EditorHeader title={draft.title} onTitleChange={onTitleChange} onSave={onSave} onCancel={onCancel} />
				<EditorArea content={draft.content} onChange={onContentChange} />
			</div>
			<MetadataPanel
				draft={draft}
				onTopicChange={onTopicChange}
				onSubtopicChange={onSubtopicChange}
				onBackgroundChange={onBackgroundChange}
				onToggleFavorite={onToggleFavorite}
				onTogglePublic={onTogglePublic}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
			/>
		</div>
	);
};

export default NotesEditor;
