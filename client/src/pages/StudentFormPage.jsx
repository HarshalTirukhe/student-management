import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";
import StudentForm from "../components/StudentForm";

function StudentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    let ignore = false;

    apiRequest(`/api/students/${id}`, { token })
      .then((student) => {
        if (ignore) return;
        setInitialValues({
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          rollNumber: student.rollNumber,
          course: student.course,
          // The API sends "2003-02-11T00:00:00.000Z", but a date input wants "2003-02-11"
          dateOfBirth: student.dateOfBirth.slice(0, 10),
        });
      })
      .catch((err) => {
        if (ignore) return;
        if (err.status === 401) logout();
        else setLoadError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, isEdit, token, logout]);

  const handleSubmit = async (values) => {
    try {
      await apiRequest(isEdit ? `/api/students/${id}` : "/api/students", {
        method: isEdit ? "PUT" : "POST",
        body: values,
        token,
      });
      navigate("/students");
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      throw err; // let the form show 400 and 409 errors
    }
  };

  return (
    <div>
      <h1>{isEdit ? "Edit student" : "Add student"}</h1>

      {loading && <p>Loading...</p>}

      {loadError && (
        <div>
          <p role="alert">{loadError}</p>
          <Link to="/students">Back to students</Link>
        </div>
      )}

      {!loading && !loadError && (
        <StudentForm
          initialValues={initialValues ?? undefined}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? "Save changes" : "Add student"}
        />
      )}
    </div>
  );
}

export default StudentFormPage;