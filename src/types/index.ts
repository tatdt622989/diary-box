import { DeltaOperation } from 'quill';

export interface Note {
  id: string;
  content: DeltaOperation;
  title: string;
}

export interface ToastMSG {
  type: string;
  content: string;
}
