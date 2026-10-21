import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";
import { useDebounce } from "../hooks/useDebounce";

const PAGE_SIZE = 10;

function StudentsPage() {
  const { token, user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

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
  }, [token, page, debouncedSearch, logout, reloadCount]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Delete ${student.firstName} ${student.lastName}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setError("");

    try {
      await apiRequest(`/api/students/${student.id}`, {
        method: "DELETE",
        token,
      });

      // Deleted the last row on a page? Step back one page.
      if (students.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        setReloadCount((c) => c + 1);
      }
    } catch (err) {
      if (err.status === 401) logout();
      else setError(err.message);
    }
  };

  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          {pagination && (
            <p className="text-sm text-gray-500">
              {pagination.total} {pagination.total === 1 ? "student" : "students"}
            </p>
          )}
        </div>

        {isAdmin && (
          <Link
            to="/students/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Add student
          </Link>
        )}
      </div>

      <input
        type="search"
        placeholder="Search by name, email or roll number"
        value={search}
        onChange={handleSearchChange}
        className="mt-6 w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {loading && students.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">Loading students...</p>
      )}

      {!loading && !error && students.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-medium text-gray-700">No students found</p>
          <p className="mt-1 text-sm text-gray-500">
            {debouncedSearch
              ? "Try a different search term."
              : "Students you add will appear here."}
          </p>
        </div>
      )}

      {students.length > 0 && (
        <div
          className={`mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-opacity ${
            loading ? "opacity-60" : ""
          }`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Roll No", "Name", "Email", "Course", "Date of birth"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                  {isAdmin && (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-100">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      {student.rollNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {student.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {student.course}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {new Date(student.dateOfBirth).toLocaleDateString(
                        undefined,
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        },
                      )}
                    </td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Link
                          to={`/students/${student.id}/edit`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(student)}
                          className="ml-4 font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && students.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1 || loading}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages || loading}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentsPage;