import { useState } from "react";
import { Link } from "react-router-dom";

const emptyValues = {
  firstName: "",
  lastName: "",
  email: "",
  rollNumber: "",
  course: "",
  dateOfBirth: "",
};

const fields = [
  { name: "firstName", label: "First name", type: "text" },
  { name: "lastName", label: "Last name", type: "text" },
  { name: "email", label: "Email", type: "email", wide: true },
  { name: "rollNumber", label: "Roll number", type: "text" },
  { name: "course", label: "Course", type: "text" },
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
];

function StudentForm({ initialValues = emptyValues, onSubmit, submitLabel }) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");
    setSaving(true);

    try {
      await onSubmit(values);
    } catch (err) {
      if (err.status === 400 && err.errors) {
        // Turn [{field, message}, ...] into { field: message }
        const mapped = {};
        err.errors.forEach(({ field, message }) => {
          if (!mapped[field]) mapped[field] = message;
        });
        setFieldErrors(mapped);
      } else {
        setFormError(err.message);
      }
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fields.map(({ name, label, type, wide }) => {
          const hasError = Boolean(fieldErrors[name]);

          return (
            <div key={name} className={wide ? "sm:col-span-2" : ""}>
              <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700"
              >
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={values[name]}
                onChange={handleChange}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${name}-error` : undefined}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  hasError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
              />
              {hasError && (
                <p
                  id={`${name}-error`}
                  role="alert"
                  className="mt-1 text-sm text-red-600"
                >
                  {fieldErrors[name]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {formError && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {formError}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
        <Link
          to="/students"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default StudentForm;