import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import PasswordInput from "../components/PasswordInput";

const fields = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    hint: "At least 8 characters",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
  },
];

function RegisterPage() {
  const { token, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in? Skip the form.
  if (token) return <Navigate to="/students" replace />;

  const handleChange = (event) => {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    // The API doesn't know about the confirm box, so we check it here
    if (values.password !== values.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setFieldErrors({});
    setLoading(true);

    // Step 1: create the account
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: {
          name: values.name,
          email: values.email,
          password: values.password,
        },
      });
    } catch (err) {
      if (err.status === 400 && err.errors) {
        const mapped = {};
        err.errors.forEach(({ field, message }) => {
          if (!mapped[field]) mapped[field] = message;
        });
        setFieldErrors(mapped);
      } else if (err.status === 409) {
        setFieldErrors({ email: "An account with this email already exists" });
      } else {
        setFormError(err.message);
      }
      setLoading(false);
      return;
    }

    // Step 2: log in with the same details
    try {
      await login(values.email, values.password);
      showToast(`Welcome, ${values.name}`);
      navigate("/students", { replace: true });
    } catch {
      // The account exists, only the automatic login failed
      showToast("Account created. Please log in.");
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
        <p className="mt-1 text-sm text-gray-500">
          New accounts can view students but not change them.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {fields.map(({ name, label, type, autoComplete, hint }) => {
            const hasError = Boolean(fieldErrors[name]);

            return (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
                {type === "password" ? (
                  <PasswordInput
                    id={name}
                    name={name}
                    value={values[name]}
                    onChange={handleChange}
                    autoComplete={autoComplete}
                    invalid={hasError}
                    describedBy={hasError ? `${name}-error` : undefined}
                  />
                ) : (
                  <input
                    id={name}
                    name={name}
                    type={type}
                    autoComplete={autoComplete}
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
                )}
                {hint && !hasError && (
                  <p className="mt-1 text-xs text-gray-500">{hint}</p>
                )}
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

          {formError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
