import { Link, useParams } from "react-router-dom";
import { BarChart3, Clock, PlayCircle } from "lucide-react";
import quizzesApi from "../../api/quizzes.js";
import Button from "../../components/ui/Button.jsx";
import { ErrorState, LoadingState } from "../../components/ui/StateBlock.jsx";
import { useAsync } from "../../hooks/useAsync.js";

const QuizDetailPage = () => {
  const { quizId } = useParams();
  const quizState = useAsync(() => quizzesApi.get(quizId), [quizId]);
  const questionState = useAsync(() => quizzesApi.questions(quizId), [quizId]);

  if (quizState.loading || questionState.loading) return <LoadingState label="Loading quiz" />;
  if (quizState.error) return <ErrorState message={quizState.error} />;
  if (questionState.error) return <ErrorState message={questionState.error} />;

  const quiz = quizState.data?.data;
  const questions = questionState.data?.data || [];

  return (
    <div className="space-y-6">
      <section className="shell-panel p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="bg-tide-50 px-3 py-1 text-xs font-bold text-tide-600" style={{ borderRadius: 8 }}>{quiz.category}</span>
          <span className={`px-3 py-1 text-xs font-bold ${quiz.isPublished ? "bg-leaf-50 text-leaf-700" : "bg-petal-50 text-petal-700"}`} style={{ borderRadius: 8 }}>
            {quiz.isPublished ? "Published" : "Draft"}
          </span>
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-ink">{quiz.title}</h1>
        <p className="mt-3 max-w-3xl text-moss">{quiz.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {quiz.isPublished ? (
            <Link to={`/quizzes/${quiz._id}/attempt`}><Button icon={PlayCircle}>Start attempt</Button></Link>
          ) : null}
          <Link to={`/quizzes/${quiz._id}/analytics`}><Button variant="secondary" icon={BarChart3}>Analytics</Button></Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Questions", quiz.totalQuestions || questions.length],
          ["Attempts", quiz.totalAttempts || 0],
          ["Minutes", quiz.timeLimit || 0],
        ].map(([label, value]) => (
          <div key={label} className="petal-card p-5">
            <p className="label">{label}</p>
            <p className="mt-3 text-3xl font-extrabold text-ink">{value}</p>
          </div>
        ))}
      </section>

      <section className="petal-card p-5">
        <div className="mb-5 flex items-center gap-2">
          <Clock className="h-5 w-5 text-leaf-700" />
          <h2 className="text-xl font-bold text-ink">Questions</h2>
        </div>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question._id} className="border border-leaf-100 bg-white/70 p-4" style={{ borderRadius: 8 }}>
              <p className="font-bold text-ink">{index + 1}. {question.text}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {question.options?.map((option) => (
                  <div key={option._id} className="border border-leaf-100 bg-white/70 px-3 py-2 text-sm font-semibold text-moss" style={{ borderRadius: 8 }}>
                    {option.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default QuizDetailPage;
