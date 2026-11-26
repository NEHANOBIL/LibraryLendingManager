
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BookOpen, Users, LayoutDashboard, Plus,
  Search, RefreshCw, BookPlus, RotateCcw, X,Pencil, Trash2
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "Fiction",
    totalCopies: 1
  });

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API}/books`, {
        params: { search, page }
      });
      setBooks(res.data.data.books);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/books/stats`);
      setStats(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchStats();
  }, [search, page]);

  const handleAddBook = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/books`, {
        ...form,
        totalCopies: Number(form.totalCopies)
      });

      alert("Book added successfully!");
      setForm({
        title: "",
        author: "",
        isbn: "",
        category: "Fiction",
        totalCopies: 1
      });

      setShowForm(false);
      fetchBooks();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add book");
    }
  };
  const handleEditBook = async (book) => {
  const title = prompt("Enter new book title:", book.title);
  if (title === null) return;

  const author = prompt("Enter new author name:", book.author);
  if (author === null) return;

  const totalCopies = prompt("Enter total copies:", book.totalCopies);
  if (totalCopies === null) return;

  try {
    await axios.put(`${API}/books/${book._id}`, {
      title,
      author,
      totalCopies: Number(totalCopies)
    });

    alert("Book updated successfully!");
    fetchBooks();
    fetchStats();
  } catch (error) {
    alert(error.response?.data?.message || "Update failed");
  }
};

const handleDeleteBook = async (id) => {
  if (!window.confirm("Are you sure you want to delete this book?")) {
    return;
  }

  try {
    await axios.delete(`${API}/books/${id}`);
    alert("Book deleted successfully!");
    fetchBooks();
    fetchStats();
  } catch (error) {
    alert(error.response?.data?.message || "Delete failed");
  }
};

  return (
    <div className="app">
      <aside className="sidebar">
        <h2><BookOpen /> Library Manager</h2>
        <p className="menu-title">MAIN MENU</p>
        <div className="menu active"><LayoutDashboard /> Dashboard</div>
        <div className="menu"><BookOpen /> Books</div>
        <div className="menu"><Users /> Members</div>
        <div className="menu"><RotateCcw /> Loans</div>
        <p className="sidebar-bottom">Library Book Lending System</p>
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome to Library Book Lending Manager</p>
          </div>
          <button onClick={() => {
            fetchBooks();
            fetchStats();
          }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        <section className="stats">
          <div className="stat-card">
            <BookOpen />
            <p>Total Books</p>
            <h2>{stats.totalBooks || 0}</h2>
          </div>
          <div className="stat-card">
            <BookPlus />
            <p>Total Copies</p>
            <h2>{stats.totalCopies || 0}</h2>
          </div>
          <div className="stat-card">
            <Users />
            <p>Issued Copies</p>
            <h2>{stats.issuedCopies || 0}</h2>
          </div>
          <div className="stat-card">
            <RotateCcw />
            <p>Overdue Loans</p>
            <h2>{stats.overdueLoans || 0}</h2>
          </div>
        </section>

        <section className="book-section">
          <div className="section-heading">
            <div>
              <h2>Book Collection</h2>
              <p>Manage your library books</p>
            </div>
            <button onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Book
            </button>
          </div>

          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {showForm && (
            <form className="book-form" onSubmit={handleAddBook}>
              <div className="form-heading">
                <h2>Add New Book</h2>
                <button type="button" onClick={() => setShowForm(false)}>
                  <X size={18} />
                </button>
              </div>

              <input
                placeholder="Book Title"
                required
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
              />

              <input
                placeholder="Author Name"
                required
                value={form.author}
                onChange={(e) => setForm({...form, author: e.target.value})}
              />

              <input
                placeholder="ISBN (10 or 13 digits)"
                required
                pattern="[0-9]{10}|[0-9]{13}"
                value={form.isbn}
                onChange={(e) => setForm({...form, isbn: e.target.value})}
              />

              <select
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
              >
                {["Fiction", "Science", "History", "Technology", "Biography", "Other"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Total Copies"
                min="1"
                max="20"
                required
                value={form.totalCopies}
                onChange={(e) => setForm({...form, totalCopies: e.target.value})}
              />

              <button type="submit">Save Book</button>
            </form>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Book Code</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>{book.bookCode}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.category}</td>
                    <td>{book.totalCopies}</td>
<td>{book.availableCopies}</td>

<td>
  <button onClick={() => handleEditBook(book)}>
    <Pencil size={15} /> Edit
  </button>

  <button
    onClick={() => handleDeleteBook(book._id)}
    style={{ background: "#dc3545", marginLeft: "8px" }}
  >
    <Trash2 size={15} /> Delete
  </button>
</td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr>
                    <td colSpan="6">No books found. Add your first book!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>Page {page}</span>
            <button onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
