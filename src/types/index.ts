export interface Note {
  id: string;
  content: string;
  title: string;
}

export interface ToastMSG {
  type: string;
  content: string;
}

export interface NoteList {
  date: string,
  notes: Array<Note>,
  time: Array<string>,
}
