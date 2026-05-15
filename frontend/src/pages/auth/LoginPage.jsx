import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage } from "../../hooks/useAsync.js";

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      showToast({ type: "success", title: "Welcome back" });
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your polling workspace.">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
        {error ? <p className="rounded-lg bg-petal-50 px-3 py-2 text-sm font-semibold text-petal-700">{error}</p> : null}
        <Button type="submit" icon={LogIn} className="w-full" disabled={loading}>
          {loading ? "Signing in" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-moss">
        New here? <Link className="font-bold text-petal-700 hover:text-ink" to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
