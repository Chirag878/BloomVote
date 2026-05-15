import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus, Send, Trash2 } from "lucide-react";
import quizzesApi from "../../api/quizzes.js";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage } from "../../hooks/useAsync.js";

const categories = ["General", "Technology", "Entertainment", "Sports", "Politics", "Health", "Education", "Other"];

const emptyQuestion = (order = 1) => ({
  text: "",
  explanation: "",
  order,
  points: 1,
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
});

const QuizCreatePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [quiz, setQuiz] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    timeLimit: 30,
  });
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState(emptyQuestion());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createQuiz = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await quizzesApi.create(form);
      setQuiz(response.data);
      showToast({ type: "success", title: "Quiz shell created" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (index, patch) => {
    setQuestion((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => (optionIndex === index ? { ...option, ...patch } : option)),
    }));
  };

  const addQuestion = async () => {
    setError("");
    const cleanOptions = question.options.filter((option) => option.text.trim());
    if (cleanOptions.length < 2) {
      setError("Add at least two options.");
      return;
    }
    if (!cleanOptions.some((option) => option.isCorrect)) {
      setError("Mark one option as correct.");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...question, options: cleanOptions, order: questions.length + 1 };
      const response = await quizzesApi.addQuestion(quiz._id, payload);
      setQuestions((current) => [...current, response.data]);
      setQuestion(emptyQuestion(questions.length + 2));
      showToast({ type: "success", title: "Question added" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const publishQuiz = async () => {
    setLoading(true);
    setError("");
    try {
      await quizzesApi.publish(quiz._id);
      showToast({ type: "success", title: "Quiz published" });
      navigate(`/quizzes/${quiz._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="label">Create quiz</p>
        <h1 className="section-title mt-2">Build a learning bloom</h1>
      </div>

      {!quiz ? (
        <form className="shell-panel space-y-5 p-5 md:p-7" onSubmit={createQuiz}>
          <FormField label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          <FormField label="Description" as="textarea" rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required />
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label">Category</span>
              <select className="field mt-2" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <FormField label="Time limit" type="number" min="1" max="240" value={form.timeLimit} onChange={(event) => setForm((current) => ({ ...current, timeLimit: Number(event.target.value) }))} required />
          </div>
          {error ? <p className="rounded-lg bg-petal-50 px-3 py-2 text-sm font-semibold text-petal-700">{error}</p> : null}
          <Button type="submit" icon={Plus} disabled={loading}>{loading ? "Creating" : "Create quiz shell"}</Button>
        </form>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <section className="shell-panel space-y-5 p-5 md:p-7">
            <div>
              <p className="label">Question {questions.length + 1}</p>
              <h2 className="mt-2 text-2xl font-bold text-ink">{quiz.title}</h2>
            </div>
            <FormField label="Question text" as="textarea" rows={3} value={question.text} onChange={(event) => setQuestion((current) => ({ ...current, text: event.target.value }))} />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Points" type="number" min="1" value={question.points} onChange={(event) => setQuestion((current) => ({ ...current, points: Number(event.target.value) }))} />
              <FormField label="Explanation" value={question.explanation} onChange={(event) => setQuestion((current) => ({ ...current, explanation: event.target.value }))} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="label">Options</span>
                <Button type="button" variant="secondary" icon={Plus} disabled={question.options.length >= 8} onClick={() => setQuestion((current) => ({ ...current, options: [...current.options, { text: "", isCorrect: false }] }))}>
                  Add
                </Button>
              </div>
              {question.options.map((option, index) => (
                <div key={index} className="flex flex-col gap-2 md:flex-row">
                  <input className="field" value={option.text} placeholder={`Option ${index + 1}`} onChange={(event) => updateOption(index, { text: event.target.value })} />
                  <Button type="button" variant={option.isCorrect ? "primary" : "secondary"} icon={Check} onClick={() => updateOption(index, { isCorrect: !option.isCorrect })}>
                    Correct
                  </Button>
                  <Button type="button" variant="ghost" icon={Trash2} disabled={question.options.length <= 2} onClick={() => setQuestion((current) => ({ ...current, options: current.options.filter((_, optionIndex) => optionIndex !== index) }))}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            {error ? <p className="rounded-lg bg-petal-50 px-3 py-2 text-sm font-semibold text-petal-700">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button type="button" icon={Plus} disabled={loading} onClick={addQuestion}>Add question</Button>
              <Button type="button" variant="secondary" icon={Send} disabled={loading || questions.length === 0} onClick={publishQuiz}>Publish quiz</Button>
            </div>
          </section>

          <aside className="petal-card h-fit p-5">
            <p className="label">Questions added</p>
            <div className="mt-4 space-y-3">
              {questions.length ? questions.map((item, index) => (
                <div key={item._id || index} className="border border-leaf-100 bg-white/70 p-3" style={{ borderRadius: 8 }}>
                  <p className="line-clamp-2 text-sm font-bold text-ink">{index + 1}. {item.text}</p>
                  <p className="mt-1 text-xs text-moss">{item.options?.length || 0} options · {item.points} point(s)</p>
                </div>
              )) : <p className="text-sm text-moss">Question cards appear here.</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default QuizCreatePage;
