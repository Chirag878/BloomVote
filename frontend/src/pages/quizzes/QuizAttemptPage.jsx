import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Send } from "lucide-react";
import quizzesApi from "../../api/quizzes.js";
import Button from "../../components/ui/Button.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import { ErrorState, LoadingState } from "../../components/ui/StateBlock.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage, useAsync } from "../../hooks/useAsync.js";

const QuizAttemptPage = () => {
  const { quizId } = useParams();
  const { showToast } = useToast();
  const quizState = useAsync(() => quizzesApi.get(quizId), [quizId]);
  const questionState = useAsync(() => quizzesApi.questions(quizId), [quizId]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const questions = questionState.data?.data || [];
  const answered = Object.keys(answers).length;

  const submit = async () => {
    if (answered !== questions.length) {
      showToast({ type: "warning", title: "Answer every question" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await quizzesApi.submitAttempt(quizId, {
        answers: Object.entries(answers).map(([question, selectedOption]) => ({
          question,
          selectedOption,
          timeTaken: 0,
        })),
      });
      setResult(response.data);
      showToast({ type: "success", title: "Attempt submitted" });
    } catch (err) {
      showToast({ type: "error", title: "Submission failed", message: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (quizState.loading || questionState.loading) return <LoadingState label="Opening quiz" />;
  if (quizState.error) return <ErrorState message={quizState.error} />;
  if (questionState.error) return <ErrorState message={questionState.error} />;

  const quiz = quizState.data?.data;

  if (result) {
    return (
      <div className="mx-auto max-w-2xl shell-panel p-6 text-center md:p-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-leaf-700" />
        <h1 className="mt-4 font-display text-4xl font-bold text-ink">{result.percentage}%</h1>
        <p className="mt-2 text-moss">
          {result.correctAnswers} of {result.totalQuestions} correct · {result.passed ? "Passed" : "Keep learning"}
        </p>
        <div className="mt-6"><ProgressBar value={result.percentage} tone={result.passed ? "leaf" : "petal"} /></div>
        <div className="mt-7 flex justify-center gap-3">
          <Link to={`/quizzes/${quizId}`}><Button variant="secondary">Quiz details</Button></Link>
          <Link to="/quizzes"><Button>All quizzes</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="shell-panel p-6 md:p-8">
        <p className="label">Quiz attempt</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">{quiz.title}</h1>
        <div className="mt-5">
          <ProgressBar value={questions.length ? (answered / questions.length) * 100 : 0} tone="tide" />
          <p className="mt-2 text-sm font-semibold text-moss">{answered} of {questions.length} answered</p>
        </div>
      </section>

      <section className="space-y-4">
        {questions.map((question, index) => (
          <div key={question._id} className="petal-card p-5">
            <p className="label">Question {index + 1}</p>
            <h2 className="mt-2 text-xl font-bold text-ink">{question.text}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {question.options?.map((option) => {
                const selected = answers[question._id] === option._id;
                return (
                  <button
                    key={option._id}
                    type="button"
                    onClick={() => setAnswers((current) => ({ ...current, [question._id]: option._id }))}
                    className={`border p-3 text-left text-sm font-bold transition ${selected ? "border-leaf-500 bg-leaf-50 text-leaf-700" : "border-leaf-100 bg-white/70 text-moss hover:border-leaf-300 hover:text-ink"}`}
                    style={{ borderRadius: 8 }}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <Button icon={Send} disabled={submitting} onClick={submit}>{submitting ? "Submitting" : "Submit attempt"}</Button>
      </div>
    </div>
  );
};

export default QuizAttemptPage;
