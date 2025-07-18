import React, { useEffect, useState } from "react";
import "./App.css";

// SUPABASE imports
import { createClient } from "@supabase/supabase-js";

// PUBLIC_INTERFACE
// Returns the Supabase client configured from process.env
function getSupabaseClient() {
  /**
   * PUBLIC_INTERFACE
   * Returns a Supabase client using environment variables for config.
   * Requires process.env.SUPABASE_URL and process.env.SUPABASE_KEY.
   */
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_KEY;
  if (!url || !key) {
    // Fallback: disabled backend, work in local mode
    return null;
  }
  return createClient(url, key);
}

const supabase = getSupabaseClient();

// Styles/colors from project definition
const customColors = {
  primary: "#1976D2",
  secondary: "#424242",
  accent: "#FFC107",
};

function useMediaQuery(query) {
  // Modern custom media query hook for responsiveness
  const [matches, setMatches] = useState(window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

// Model for a note
/**
 * { id, title, content, created_at, updated_at }
 */

/* -----------------------------------------------
 * COMPONENT: NotesListSidebar
 * ---------------------------------------------*/
function NotesListSidebar({
  notes,
  onSelect,
  selectedId,
  onAddNote,
  search,
  setSearch,
  collapsed,
  onCollapse,
}) {
  return (
    <aside className={`notes-sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-header">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search notes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="add-btn" onClick={onAddNote} title="Add note">
          ＋
        </button>
        <button
          className="sidebar-toggle"
          onClick={onCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>
      {!collapsed && (
        <ul className="notes-list">
          {notes.length === 0 && (
            <li className="notes-list-empty">No notes found.</li>
          )}
          {notes.map((note) => (
            <li
              key={note.id}
              className={selectedId === note.id ? "active" : ""}
              onClick={() => onSelect(note.id)}
            >
              <div className="note-title">{note.title || "(Untitled)"}</div>
              <div className="note-snippet">
                {note.content?.substring(0, 48)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

/* -----------------------------------------------
 * COMPONENT: NoteEditor
 * ---------------------------------------------*/
function NoteEditor({
  note,
  onSave,
  onDelete,
  onChange,
  saving,
  isNew,
  hasChanges,
}) {
  // Track local changes if editing
  if (!note) {
    return (
      <main className="note-editor empty-state">
        <div className="empty-message">
          <span className="emoji">📝</span>
          <div>Select or create a note to begin!</div>
        </div>
      </main>
    );
  }
  return (
    <main className="note-editor">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        autoComplete="off"
      >
        <input
          className="note-title-input"
          placeholder="Title..."
          value={note.title}
          onChange={(e) => onChange({ ...note, title: e.target.value })}
          maxLength={64}
        />
        <textarea
          className="note-content-input"
          placeholder="Write your note here..."
          value={note.content}
          onChange={(e) => onChange({ ...note, content: e.target.value })}
        />
        <div className="note-actions">
          <button
            type="submit"
            className="save-btn"
            disabled={!hasChanges || saving}
            title={isNew ? "Create Note" : "Save changes"}
          >
            {saving ? "Saving..." : isNew ? "Create" : "Save"}
          </button>
          {!isNew && (
            <button
              type="button"
              className="delete-btn"
              onClick={onDelete}
              disabled={saving}
              title="Delete note"
            >
              Delete
            </button>
          )}
        </div>
        {note.updated_at && (
          <div className="note-timestamp">
            {isNew
              ? ""
              : `Last updated: ${new Date(note.updated_at).toLocaleString()}`}
          </div>
        )}
      </form>
    </main>
  );
}

/* -----------------------------------------------
 * MAIN: App
 * ---------------------------------------------*/
// PUBLIC_INTERFACE
function App() {
  /**
   * PUBLIC_INTERFACE
   * Main entry for the personal notes app.
   * Renders sidebar, header, note editor, state management, and Supabase integration.
   */
  // State
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [editorNote, setEditorNote] = useState(null);
  const [editorOriginal, setEditorOriginal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  // Theme control
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Data source: supabase or localStorage
  const offline = !supabase;

  // Load notes on mount and when changed
  useEffect(() => {
    (async () => {
      if (supabase) {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .order("updated_at", { ascending: false });
        setNotes(data || []);
      } else {
        // Fallback to localStorage
        const json = window.localStorage.getItem("notes-app-notes");
        setNotes(json ? JSON.parse(json) : []);
      }
    })();
  }, []);

  // Save notes to localStorage in offline mode whenever they change
  useEffect(() => {
    if (!supabase) {
      window.localStorage.setItem(
        "notes-app-notes",
        JSON.stringify(notes ?? [])
      );
    }
  }, [notes]);

  // When selectedId changes, set editorNote
  useEffect(() => {
    if (selectedId === null) {
      setEditorNote(null);
      setEditorOriginal(null);
      return;
    }
    const note = notes.find((n) => n.id === selectedId);
    setEditorNote(note ? { ...note } : null);
    setEditorOriginal(note ? { ...note } : null);
  }, [selectedId, notes]);

  // Filter notes by search
  const filteredNotes = search
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  // Add new note
  const createNewNote = () => {
    // Temporary ID; real one comes from Supabase/localStorage
    const newNote = {
      id: Date.now(),
      title: "",
      content: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditorNote(newNote);
    setEditorOriginal({ ...newNote });
    setSelectedId(newNote.id);
  };

  // Save note (create or update)
  const saveCurrentNote = async () => {
    if (!editorNote) return;
    setSaving(true);
    let savedNote;
    if (offline) {
      // Local update/create
      let updated = notes.slice();
      const idx = updated.findIndex((n) => n.id === editorNote.id);
      if (idx > -1) {
        editorNote.updated_at = new Date().toISOString();
        updated[idx] = { ...editorNote };
      } else {
        editorNote.created_at = new Date().toISOString();
        editorNote.updated_at = editorNote.created_at;
        updated.unshift(editorNote);
      }
      setNotes(updated);
      savedNote = { ...editorNote };
    } else {
      if (editorNote.id && !isNaN(editorNote.id)) {
        // new, needs to be inserted
        const noteNoId = { ...editorNote };
        delete noteNoId.id;
        const { data, error } = await supabase
          .from("notes")
          .insert([
            {
              ...noteNoId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select("*");
        if (error) {
          alert("Failed to create note: " + error.message);
        } else if (data && data.length > 0) {
          setNotes([data[0], ...notes]);
          setSelectedId(data[0].id);
          savedNote = data[0];
        }
      } else {
        // Update existing
        const { data, error } = await supabase
          .from("notes")
          .update({
            title: editorNote.title,
            content: editorNote.content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editorNote.id)
          .select("*");
        if (error) {
          alert("Failed to update note: " + error.message);
        } else if (data && data.length > 0) {
          setNotes([
            data[0],
            ...notes.filter((n) => n.id !== editorNote.id),
          ]);
          savedNote = data[0];
        }
      }
    }
    setSaving(false);
    if (savedNote) {
      setEditorOriginal({ ...savedNote });
      setEditorNote({ ...savedNote });
      setSelectedId(savedNote.id);
    }
  };

  // Delete note
  const deleteCurrentNote = async () => {
    if (!editorNote) return;
    if (!window.confirm("Delete this note?")) return;
    setSaving(true);
    if (offline) {
      setNotes(notes.filter((n) => n.id !== editorNote.id));
    } else {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", editorNote.id);
      if (error) {
        alert("Failed to delete note: " + error.message);
        setSaving(false);
        return;
      }
      setNotes(notes.filter((n) => n.id !== editorNote.id));
    }
    setSaving(false);
    setSelectedId(null);
    setEditorNote(null);
    setEditorOriginal(null);
  };

  // Track if editor has unsaved changes
  const hasChanges =
    editorNote &&
    (editorNote.title !== editorOriginal?.title ||
      editorNote.content !== editorOriginal?.content);

  // UI
  return (
    <div className="notes-root">
      <header className="notes-header">
        <span className="app-title" style={{ color: customColors.primary }}>
          📝 Notes Organizer
        </span>
        <span className="brand-dot" style={{ background: customColors.accent }} />
        <span className="header-tools">
          <button
            className="add-btn header-add"
            onClick={createNewNote}
            title="Create new note"
          >
            ＋
          </button>
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </span>
      </header>
      <div className="notes-app-main">
        <NotesListSidebar
          notes={filteredNotes}
          onSelect={setSelectedId}
          selectedId={selectedId}
          onAddNote={createNewNote}
          search={search}
          setSearch={setSearch}
          collapsed={sidebarCollapsed && !isMobile}
          onCollapse={() => setSidebarCollapsed((c) => !c)}
        />
        <NoteEditor
          note={editorNote}
          onSave={saveCurrentNote}
          onDelete={deleteCurrentNote}
          onChange={setEditorNote}
          isNew={editorNote && (!editorNote.id || !notes.some(n => n.id === editorNote.id))}
          hasChanges={hasChanges}
          saving={saving}
        />
      </div>
      <footer className="notes-footer">
        <span>
          {offline
            ? "Offline mode (localStorage saves only)."
            : "Powered by Supabase"}
        </span>
        <a
          href="https://supabase.com/"
          rel="noopener noreferrer"
          className="footer-link"
          target="_blank"
        >
          Supabase
        </a>
      </footer>
    </div>
  );
}

export default App;
