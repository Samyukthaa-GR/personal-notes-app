import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");

  // Fetch notes from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/notes")
      .then(res => res.json())
      .then(setNotes)
      .catch(console.error);
  }, []);

  // Add a new note
  const addNote = () => {
    if (!title || !content) return;

    const noteData = {
      title,
      content,
      tags: tags.split(",").map(tag => tag.trim()),
    };

    fetch("http://localhost:5000/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData)
    })
      .then(res => res.json())
      .then(newNote => {
        setNotes([...notes, newNote]);
        setTitle("");
        setContent("");
        setTags("");
      })
      .catch(console.error);
  };

  // Delete a note
  const deleteNote = (id) => {
    fetch(`http://localhost:5000/api/notes/${id}`, { method: "DELETE" })
      .then(() => setNotes(notes.filter(n => n._id !== id)))
      .catch(console.error);
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="app-container">
      <h1>Personal Notes App</h1>

      {/* Search */}
      <input
        className="search-bar"
        placeholder="Search notes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Create Note */}
      <div className="note-form">
        <input
          className="note-title"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <ReactQuill
          value={content}
          onChange={setContent}
          className="note-editor"
        />
        <input
          className="note-tags"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />
        <button className="add-btn" onClick={addNote}>Add Note</button>
      </div>

      {/* Notes List */}
      <ul className="notes-list">
        {filteredNotes.map(note => (
          <li key={note._id} className="note-card">
            <h3>{note.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: note.content }} />
            <p className="tags"><strong>Tags:</strong> {note.tags.join(", ")}</p>
            <p className="timestamp">{new Date(note.createdAt).toLocaleString()}</p>
            <button className="delete-btn" onClick={() => deleteNote(note._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
