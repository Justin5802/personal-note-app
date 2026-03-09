import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 const API_URL = 'https://ieywp955r7.execute-api.us-east-1.amazonaws.com/Prod';

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/notes`);
      const data = await response.json();
      setNotes(data.notes.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
    } catch (err) {
      setError('Failed to fetch notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      
      const data = await response.json();
      if (data.success) {
        setNotes([data.note, ...notes]);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      setError('Failed to create note');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
  setLoading(true);
  setError(''); 
  
  console.log("🗑️ Attempting to delete note:", noteId);
  console.log("📡 Full URL:", `${API_URL}/notes/${noteId}`);
  
  try {
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'DELETE',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log("📊 Response status:", response.status);
    console.log("📋 Response headers:", Object.fromEntries([...response.headers]));
    
    const responseText = await response.text();
    console.log("📄 Response text:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("✅ Parsed JSON:", data);
    } catch (e) {
      console.log("❌ Response is not JSON:", e);
      data = { success: false };
    }
    
    if (response.ok && data.success) {
      console.log("✅ Delete successful, updating UI");
      setNotes(notes.filter(note => note.noteId !== noteId));
    } else {
      console.log("❌ Delete failed:", data);
      setError(`Delete failed: ${response.status} - ${responseText}`);
    }
  } catch (err) {
    console.error("🔥 Network or other error:", err);
    setError('Failed to delete note: ' + err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Personal Notes</h1>
      </header>

      <main className="app-main">
        <section className="create-note">
          <h2>Create New Note</h2>
          <form onSubmit={createNote}>
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
            <textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows="4"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Note'}
            </button>
          </form>
        </section>

        <section className="notes-list">
          <h2>Your Notes</h2>
          {error && <div className="error">{error}</div>}
          
          {loading && notes.length === 0 ? (
            <div className="loading">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <p>No notes yet. Create your first note above! ✨</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <div key={note.noteId} className="note-card">
                  <div className="note-header">
                    <h3>{note.title}</h3>
                    <button 
                      onClick={() => deleteNote(note.noteId)}
                      className="delete-btn"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                  <p className="note-content">{note.content}</p>
                  <div className="note-footer">
                    <small>
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;