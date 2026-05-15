import { Link } from "react-router-dom";
import { BarChart3, ClipboardCheck, PlayCircle } from "lucide-react";

const QuizCard = ({ quiz }) => (
  <article className="petal-card p-5">
    <div className="flex items-start justify-between gap-3">
      <span className="bg-tide-50 px-2.5 py-1 text-xs font-bold text-tide-600" style={{ borderRadius: 8 }}>{quiz.category}</span>
      <span className={`px-2.5 py-1 text-xs font-bold ${quiz.isPublished ? "bg-leaf-50 text-leaf-700" : "bg-petal-50 text-petal-700"}`} style={{ borderRadius: 8 }}>
        {quiz.isPublished ? "Published" : "Draft"}
      </span>
    </div>
    <h2 className="mt-4 line-clamp-2 text-xl font-bold leading-snug text-ink">{quiz.title}</h2>
    <p className="mt-2 line-clamp-2 text-sm leading-6 text-moss">{quiz.description}</p>
    <div className="mt-5 grid grid-cols-3 gap-2">
      <div className="bg-white/70 p-3 text-center" style={{ borderRadius: 8 }}>
        <p className="font-extrabold text-ink">{quiz.totalQuestions || 0}</p>
        <p className="text-xs font-semibold text-moss">Questions</p>
      </div>
      <div className="bg-white/70 p-3 text-center" style={{ borderRadius: 8 }}>
        <p className="font-extrabold text-ink">{quiz.totalAttempts || 0}</p>
        <p className="text-xs font-semibold text-moss">Attempts</p>
      </div>
      <div className="bg-white/70 p-3 text-center" style={{ borderRadius: 8 }}>
        <p className="font-extrabold text-ink">{quiz.timeLimit || 0}</p>
        <p className="text-xs font-semibold text-moss">Minutes</p>
      </div>
    </div>
    <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm font-bold">
      <Link className="inline-flex items-center gap-1.5 text-leaf-700 hover:text-ink" to={`/quizzes/${quiz._id}`}>
        <ClipboardCheck className="h-4 w-4" />
        Open
      </Link>
      {quiz.isPublished ? (
        <Link className="inline-flex items-center gap-1.5 text-petal-700 hover:text-ink" to={`/quizzes/${quiz._id}/attempt`}>
          <PlayCircle className="h-4 w-4" />
          Attempt
        </Link>
      ) : null}
      <Link className="inline-flex items-center gap-1.5 text-tide-600 hover:text-ink" to={`/quizzes/${quiz._id}/analytics`}>
        <BarChart3 className="h-4 w-4" />
        Stats
      </Link>
    </div>
  </article>
);

export default QuizCard;
