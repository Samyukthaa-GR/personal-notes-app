import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [editNoteId, setEditNoteId] = useState(null);

  // Simulated login
  const handleLogin = () => {
    if (username && password) setLoggedIn(true);
  };

  // Fetch notes
  useEffect(() => {
    if (!loggedIn) return;
    fetch("http://localhost:5000/api/notes")
      .then((res) => res.json())
      .then(setNotes)
      .catch(console.error);
  }, [loggedIn]);

  // Add or update a note
  const handleSaveNote = () => {
    if (!title && !content) return;

    const noteData = {
      title,
      content,
      tags: tags.split(",").map((t) => t.trim()),
    };

    if (editNoteId) {
      // Update existing note
      fetch(`http://localhost:5000/api/notes/${editNoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      })
        .then((res) => res.json())
        .then((updatedNote) => {
          setNotes(
            notes.map((n) => (n._id === editNoteId ? updatedNote : n))
          );
          resetNoteForm();
        });
    } else {
      // Create new note
      fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      })
        .then((res) => res.json())
        .then((newNote) => {
          setNotes([newNote, ...notes]);
          resetNoteForm();
        });
    }
  };

  // Delete note
  const deleteNote = (id) => {
    fetch(`http://localhost:5000/api/notes/${id}`, { method: "DELETE" }).then(
      () => setNotes(notes.filter((n) => n._id !== id))
    );
  };

  // Start editing a note
  const startEditing = (note) => {
    setEditNoteId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(", "));
  };

  // Reset form after saving/editing
  const resetNoteForm = () => {
    setEditNoteId(null);
    setTitle("");
    setContent("");
    setTags("");
  };

  // Extract unique tags for the dropdown
  const allTags = [
    "All",
    ...new Set(notes.flatMap((note) => note.tags || [])),
  ];

  // Filter and search notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesTag =
      selectedTag === "All" || note.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  // -------------------------------------------
  // LOGIN PAGE
  // -------------------------------------------

  if (!loggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h2>Welcome</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  // -------------------------------------------
  // MAIN APP (NOTES UI)
  // -------------------------------------------

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <h1>My Notes</h1>
        <div className="header-controls">
          <input
            className="search-bar"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="tag-filter"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            {allTags.map((tag, i) => (
              <option key={i} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Add/Edit Note */}
      <div className="note-input">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="note-title"
        />
        <ReactQuill
          value={content}
          onChange={setContent}
          className="note-editor"
        />
        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="note-tags"
        />
        <div className="note-buttons">
          <button className="add-btn" onClick={handleSaveNote}>
            {editNoteId ? "Update Note" : "Add Note"}
          </button>
          {editNoteId && (
            <button className="cancel-btn" onClick={resetNoteForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Notes Gallery */}
      <main className="notes-gallery">
        {filteredNotes.map((note) => (
          <div key={note._id} className="note-card">
            <h3>{note.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: note.content }} />
            {note.tags.length > 0 && (
              <p className="tags">{note.tags.join(", ")}</p>
            )}
            <p className="timestamp">
              {new Date(note.createdAt).toLocaleString()}
            </p>
            <div className="note-actions">
              <button
                className="edit-btn"
                onClick={() => startEditing(note)}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteNote(note._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
