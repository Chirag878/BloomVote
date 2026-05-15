import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage } from "../../hooks/useAsync.js";

const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.userName.trim().length < 5) {
      setError("Username must be at least 5 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      showToast({ type: "success", title: "Account created" });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start building live polls and quizzes.">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormField label="Username" name="userName" value={form.userName} onChange={handleChange} required />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
        <FormField label="Password" name="password" type="password" minLength={6} value={form.password} onChange={handleChange} required />
        {error ? <p className="rounded-lg bg-petal-50 px-3 py-2 text-sm font-semibold text-petal-700">{error}</p> : null}
        <Button type="submit" icon={UserPlus} className="w-full" disabled={loading}>
          {loading ? "Creating" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-moss">
        Already registered? <Link className="font-bold text-petal-700 hover:text-ink" to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
