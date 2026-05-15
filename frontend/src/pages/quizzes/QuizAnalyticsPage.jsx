import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Gauge } from "lucide-react";
import quizzesApi from "../../api/quizzes.js";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { ErrorState, LoadingState } from "../../components/ui/StateBlock.jsx";
import { useAsync } from "../../hooks/useAsync.js";

const QuizAnalyticsPage = () => {
  const { quizId } = useParams();
  const { data, loading, error } = useAsync(() => quizzesApi.analytics(quizId), [quizId]);

  if (loading) return <LoadingState label="Reading quiz analytics" />;
  if (error) return <ErrorState message={error} />;

  const analytics = data?.data;
  const summary = analytics?.summary || {};

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/quizzes/${quizId}`} className="inline-flex items-center gap-2 text-sm font-bold text-moss hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Back to quiz
        </Link>
        <h1 className="section-title mt-3">{analytics?.quiz?.title}</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Attempts" value={summary.attempts} icon={ClipboardCheck} tone="tide" />
        <StatCard label="Average score" value={summary.averageScore || 0} icon={Gauge} tone="petal" />
        <StatCard label="Pass rate" value={`${summary.passRate || 0}%`} icon={CheckCircle2} tone="leaf" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="petal-card p-5">
          <p className="label">Daily attempts</p>
          <div className="mt-5 space-y-4">
            {analytics?.dailyAttempts?.length ? analytics.dailyAttempts.map((item) => (
              <div key={item.date}>
                <div className="mb-2 flex justify-between text-sm font-bold text-moss">
                  <span>{item.date}</span>
                  <span>{item.attempts}</span>
                </div>
                <ProgressBar value={Math.min(item.attempts * 12, 100)} tone="tide" />
              </div>
            )) : <p className="text-sm text-moss">Attempt trends will appear here.</p>}
          </div>
        </div>

        <div className="petal-card p-5">
          <p className="label">Question accuracy</p>
          <div className="mt-5 space-y-4">
            {analytics?.questionPerformance?.length ? analytics.questionPerformance.map((item) => (
              <div key={item.question}>
                <div className="mb-2 flex justify-between text-sm font-bold text-moss">
                  <span className="truncate">Question {String(item.question).slice(-5)}</span>
                  <span>{item.accuracy}%</span>
                </div>
                <ProgressBar value={item.accuracy} tone={item.accuracy >= 60 ? "leaf" : "petal"} />
              </div>
            )) : <p className="text-sm text-moss">Question accuracy will appear after attempts.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuizAnalyticsPage;
