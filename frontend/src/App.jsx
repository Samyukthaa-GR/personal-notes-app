import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");

  // Simulated login/signup (temporary — replace with backend later)
  const handleAuth = () => {
    if (username && password && (isSignup ? email : true)) setLoggedIn(true);
  };

  // Fetch notes once logged in
  useEffect(() => {
    if (!loggedIn) return;
    fetch("http://localhost:5000/api/notes")
      .then((res) => res.json())
      .then(setNotes)
      .catch(console.error);
  }, [loggedIn]);

  const addNote = () => {
    if (!title && !content) return;
    const noteData = {
      title,
      content,
      tags: tags.split(",").map((t) => t.trim()),
    };
    fetch("http://localhost:5000/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    })
      .then((res) => res.json())
      .then((newNote) => {
        setNotes([newNote, ...notes]);
        setTitle("");
        setContent("");
        setTags("");
      });
  };

  const deleteNote = (id) => {
    fetch(`http://localhost:5000/api/notes/${id}`, { method: "DELETE" }).then(() =>
      setNotes(notes.filter((n) => n._id !== id))
    );
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  /* -------------------- LOGIN / SIGNUP PAGE -------------------- */
  if (!loggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
          <p>{isSignup ? "Join us to save your ideas" : "Sign in to access your notes"}</p>

          {isSignup && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
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
          <button onClick={handleAuth}>{isSignup ? "Sign Up" : "Login"}</button>

          {!isSignup && (
            <div className="login-links">
              <a href="#">Forgot Password?</a>
              <a href="#">Need Help?</a>
            </div>
          )}

          <div className="signup-text">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <a href="#" onClick={() => setIsSignup(false)}>
                  Login
                </a>
              </>
            ) : (
              <>
                Don’t have an account?{" "}
                <a href="#" onClick={() => setIsSignup(true)}>
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- MAIN APP -------------------- */
  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <h1>My Notes</h1>
        <input
          className="search-bar"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {/* Add Note */}
      <div className="note-input">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="note-title"
        />
        <ReactQuill value={content} onChange={setContent} className="note-editor" />
        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="note-tags"
        />
        <button className="add-btn" onClick={addNote}>
          Add
        </button>
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
            <button className="delete-btn" onClick={() => deleteNote(note._id)}>
              Delete
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
