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
  { name: "email", label: "Email", type: "email" },
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
      {fields.map(({ name, label, type }) => (
        <div key={name}>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            name={name}
            type={type}
            value={values[name]}
            onChange={handleChange}
          />
          {fieldErrors[name] && <p role="alert">{fieldErrors[name]}</p>}
        </div>
      ))}

      {formError && <p role="alert">{formError}</p>}

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : submitLabel}
      </button>{" "}
      <Link to="/students">Cancel</Link>
    </form>
  );
}

export default StudentForm;