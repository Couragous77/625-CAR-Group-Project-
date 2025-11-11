import { useState, useRef } from "react";
import { z } from "zod";
import { auth } from "../lib/api";
import FieldError from "../components/FieldError.jsx";
import { useNavigate } from "react-router-dom";


const RegisterSchema = z
  .object({
    email: z.string().email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string().min(8, "Confirm your password."),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match.",
  });

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({}); // { email, password, confirm }
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);
  const pwRef = useRef(null);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    // live-clear that field’s error
    if (errors[e.target.name]) {
      setErrors((er) => ({ ...er, [e.target.name]: undefined }));
    }
  };

  const validate = () => {
    const parsed = RegisterSchema.safeParse(form);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors = {};
    parsed.error.issues.forEach((i) => {
      const key = i.path[0];
      if (!fieldErrors[key]) fieldErrors[key] = i.message;
    });
    setErrors(fieldErrors);
    // focus first invalid field
    if (fieldErrors.email) emailRef.current?.focus();
    else if (fieldErrors.password) pwRef.current?.focus();
    return false;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await auth.register({ email: form.email, password: form.password });
      navigate("/login?registered=1");
    } catch (err) {
      // err is normalized in api.js
      if (err.fields) setErrors((prev) => ({ ...prev, ...err.fields }));
      else setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>

      {apiError && (
        <div role="alert" className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <label className="block mb-1" htmlFor="email">Email</label>
        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          className={`w-full rounded border p-2 ${errors.email ? "border-red-500" : "border-gray-300"}`}
          value={form.email}
          onChange={onChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          autoComplete="email"
        />
        <FieldError id="email-error">{errors.email}</FieldError>

        <label className="block mt-4 mb-1" htmlFor="password">Password</label>
        <input
          ref={pwRef}
          id="password"
          name="password"
          type="password"
          className={`w-full rounded border p-2 ${errors.password ? "border-red-500" : "border-gray-300"}`}
          value={form.password}
          onChange={onChange}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          autoComplete="new-password"
        />
        <FieldError id="password-error">{errors.password}</FieldError>

        <label className="block mt-4 mb-1" htmlFor="confirm">Confirm password</label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          className={`w-full rounded border p-2 ${errors.confirm ? "border-red-500" : "border-gray-300"}`}
          value={form.confirm}
          onChange={onChange}
          aria-invalid={!!errors.confirm}
          aria-describedby={errors.confirm ? "confirm-error" : undefined}
          autoComplete="new-password"
        />
        <FieldError id="confirm-error">{errors.confirm}</FieldError>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
