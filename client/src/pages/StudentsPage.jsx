import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import { Link } from "react-router-dom";

const PAGE_SIZE = 10;

function StudentsPage() {
  const { token, user, logout } = useAuth();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let ignore = false;

    async function loadStudents() {
      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch,
        });
        const result = await apiRequest(`/api/students?${query}`, { token });

        if (ignore) return;
        setStudents(result.data);
        setPagination(result.pagination);
      } catch (err) {
        if (ignore) return;
        if (err.status === 401) {
          logout();
        } else {
          setError(err.message);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadStudents();

    return () => {
      ignore = true;
    };
  }, [token, page, debouncedSearch, logout]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  return (
    <div>
      <h1>Students</h1>
      <p>
        Logged in as {user?.name} ({user?.role}){" "}
        <button onClick={logout}>Log out</button>
      </p>

      <p>
        <Link to="/students/new">Add student</Link>
      </p>

      <input
        type="search"
        placeholder="Search by name, email or roll number"
        value={search}
        onChange={handleSearchChange}
      />

      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && !error && students.length === 0 && <p>No students found.</p>}

      {students.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Date of birth</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.rollNumber}</td>
                <td>
                  {student.firstName} {student.lastName}
                </td>
                <td>{student.email}</td>
                <td>{student.course}</td>
                <td>{new Date(student.dateOfBirth).toLocaleDateString()}</td>
                <td>
                  <Link to={`/students/${student.id}/edit`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination && (
        <div>
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </button>
          <span>
            {" "}
            Page {page} of {totalPages} ({pagination.total} students){" "}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentsPage;
