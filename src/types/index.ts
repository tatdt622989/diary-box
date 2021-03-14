import { DeltaOperation } from 'quill';

export interface Note {
  id: string;
  content: DeltaOperation;
}
