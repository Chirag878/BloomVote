import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import pollsApi from "../../api/polls.js";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage } from "../../hooks/useAsync.js";

const categories = ["General", "Technology", "Entertainment", "Sports", "Politics", "Health", "Education", "Other"];

const PollCreatePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    question: "",
    category: "General",
    expiresAt: "",
    allowsMultipleVotes: false,
    options: ["", ""],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateOption = (index, value) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, itemIndex) => (itemIndex === index ? value : option)),
    }));
  };

  const removeOption = (index) => {
    setForm((current) => ({
      ...current,
      options: current.options.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const options = form.options.map((text) => text.trim()).filter(Boolean);
    if (options.length < 2) {
      setError("Add at least two options.");
      return;
    }

    setLoading(true);
    try {
      const response = await pollsApi.create({ ...form, options, expiresAt: form.expiresAt || undefined });
      showToast({ type: "success", title: "Poll created" });
      navigate(`/polls/${response.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="label">Create poll</p>
        <h1 className="section-title mt-2">Shape a fresh question</h1>
      </div>

      <form className="shell-panel space-y-5 p-5 md:p-7" onSubmit={handleSubmit}>
        <FormField label="Question" as="textarea" rows={4} value={form.question} onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))} required />
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="label">Category</span>
            <select className="field mt-2" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <FormField label="Expires at" type="datetime-local" value={form.expiresAt} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} />
        </div>

        <label className="flex items-center gap-3 border border-leaf-100 bg-white/70 p-3" style={{ borderRadius: 8 }}>
          <input
            type="checkbox"
            checked={form.allowsMultipleVotes}
            onChange={(event) => setForm((current) => ({ ...current, allowsMultipleVotes: event.target.checked }))}
            className="h-4 w-4 accent-leaf-500"
          />
          <span className="text-sm font-semibold text-ink">Allow voters to choose more than one option</span>
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="label">Options</span>
            <Button type="button" variant="secondary" icon={Plus} disabled={form.options.length >= 10} onClick={() => setForm((current) => ({ ...current, options: [...current.options, ""] }))}>
              Add option
            </Button>
          </div>
          {form.options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input className="field" value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${index + 1}`} />
              <Button type="button" variant="ghost" icon={Trash2} disabled={form.options.length <= 2} onClick={() => removeOption(index)}>
                Remove
              </Button>
            </div>
          ))}
        </div>

        {error ? <p className="rounded-lg bg-petal-50 px-3 py-2 text-sm font-semibold text-petal-700">{error}</p> : null}
        <Button type="submit" icon={Plus} disabled={loading}>{loading ? "Creating" : "Create poll"}</Button>
      </form>
    </div>
  );
};

export default PollCreatePage;
