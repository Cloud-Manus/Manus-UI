import { ToolResponse } from "./base";

/**
 * Type definitions for StrReplaceEditor tool
 */

// Command type for the str_replace_editor tool
export type StrReplaceEditorCommand = 'view' | 'create' | 'str_replace' | 'insert' | 'undo_edit';

// Base interface for all str_replace_editor commands
interface StrReplaceEditorBase {
  command: StrReplaceEditorCommand;
  path: string; // Absolute path to file or directory
}

// Interface for the 'view' command
interface StrReplaceEditorViewParams extends StrReplaceEditorBase {
  command: 'view';
  view_range?: [number, number]; // Optional line range to view [start, end]
}

// Interface for the 'create' command
interface StrReplaceEditorCreateParams extends StrReplaceEditorBase {
  command: 'create';
  file_text: string; // Content of the file to be created
}

// Interface for the 'str_replace' command
interface StrReplaceEditorStrReplaceParams extends StrReplaceEditorBase {
  command: 'str_replace';
  old_str: string; // String in file to replace
  new_str?: string; // New string (optional - if not provided, no string will be added)
}

// Interface for the 'insert' command
interface StrReplaceEditorInsertParams extends StrReplaceEditorBase {
  command: 'insert';
  insert_line: number; // Line after which to insert text
  new_str: string; // String to insert
}

// Interface for the 'undo_edit' command
interface StrReplaceEditorUndoEditParams extends StrReplaceEditorBase {
  command: 'undo_edit';
}

// Union type for all str_replace_editor parameter types
export type StrReplaceEditorParams = 
  | StrReplaceEditorViewParams
  | StrReplaceEditorCreateParams 
  | StrReplaceEditorStrReplaceParams
  | StrReplaceEditorInsertParams
  | StrReplaceEditorUndoEditParams;

export type StrReplaceEditorResponse = {
  result: ToolResponse;
}

export type StrReplaceEditorDetails = StrReplaceEditorParams & StrReplaceEditorResponse;