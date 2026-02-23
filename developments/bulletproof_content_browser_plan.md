# Bulletproof Content Browser Implementation Plan

This document outlines the proposed architecture and implementation steps to consolidate redundant admin pages (`HiddenContentManager`, `AllContentsManager`) into a unified, intelligent, and safe **Content Browser**.

## 1. Visibility: See What You Are Changing

Instead of guessing what is currently inside a document's frontmatter, we will add an inline **Frontmatter Inspector**.

- **Expandable Rows or Tooltips:** We will add an "info/code" toggle button to each row in the browser. Clicking it will expand the row downwards or open a popup showing a pretty-printed JSON/Markdown representation of the document's current frontmatter.
- **Live Preview of Target Field:** When you select a specific frontmatter field in the Batch Editor (e.g., `draft`), a new column will temporarily appear in the table showing the _current value_ of that specific field for every document. This makes it crystal clear what state each document is in before applying a batch update.

## 2. Smart Editor Status (Handling Variety)

If multiple documents are selected with varying frontmatter values, the editor needs to warn the user safely.

- **Indeterminate/Mixed State:** When a field is chosen, the editor will analyze all selected documents.
  - If all selected documents have the **exact same value**, the input control will display that value.
  - If the values **vary** across the selected documents, the control will enter a _Mixed State_ (e.g., text will turn grey with a placeholder like `"Multiple values present"`, or a toggle switch will become a neutral dash `[-]`). This alerts the user that hitting save will overwrite this variance.

## 3. Intelligent Array Handling (Tags, Categories, Keywords)

Modifying multi-value arrays in batch requires specific logic to avoid duplication or destructive overwrites.

- **Action Modes for Arrays:** When an array field (e.g., `tags` or `categories`) is selected, the Batch Editor will offer a new sub-dropdown with three actions:
  1.  **Add (Merge):** The user types a comma-separated list of tags. The system parses them, checks the existing arrays of the selected documents, and _only_ injects the tags that don't already exist. No duplicates will be created.
  2.  **Remove:** The user specifies tags to remove. The system trims them out of the arrays of the selected documents without touching other existing tags.
  3.  **Replace Entirely:** The standard overwrite behavior to completely clear out old tags and assign brand new ones.

## 4. The Core Features

- **Unified Checkbox Selection:** Select single, multiple, or all matching documents directly in the Content Browser.
- **Collapsible Top Editor:** A clean, hidden-by-default top pane that houses the batch editing controls.
- **Protected Fields:** Core system properties (e.g., `slug`, `lang`, `collection`) will be hard-coded into a blacklist so they cannot be accidentally or maliciously corrupted via batch editing.

## 5. Implementation Steps

1.  **Backend (`bulkContent.ts`):** Upgrade the `/api/bulk-content/update-frontmatter` route to handle the array operation modes (merge, remove, replace).
2.  **Frontend (`ContentBrowser.tsx`):** Implement the checkbox selection, expandable frontmatter inspector, mixed-state input controls, and array action sub-menus.
3.  **Cleanup:** Delete the redundant pages (`HiddenContentManager.tsx`, `AllContentsManager.tsx`) and remove their corresponding routes from `Sidebar.tsx`.
