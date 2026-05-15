import { BarChart3, ClipboardCheck, Flower2, TrendingUp, Vote } from "lucide-react";
import analyticsApi from "../../api/analytics.js";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { ErrorState, LoadingState } from "../../components/ui/StateBlock.jsx";
import { useAsync } from "../../hooks/useAsync.js";

const activityLabel = {
  poll_created: "Poll created",
  vote_cast: "Vote cast",
  quiz_created: "Quiz created",
  quiz_attempt: "Quiz attempt",
};

const AnalyticsPage = () => {
  const { data, loading, error } = useAsync(async () => {
    const [polls, quizzes, activity] = await Promise.all([
      analyticsApi.polls(),
      analyticsApi.quizzes(),
      analyticsApi.activity(),
    ]);
    return { polls: polls.data, quizzes: quizzes.data, activity: activity.data };
  }, []);

  if (loading) return <LoadingState label="Loading analytics" />;
  if (error) return <ErrorState message={error} />;

  const polls = data?.polls || {};
  const quizzes = data?.quizzes || {};

  return (
    <div className="space-y-6">
      <section>
        <p className="label">Analytics</p>
        <h1 className="section-title mt-2">Signals in bloom</h1>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Polls" value={polls.totalPolls} helper={`${polls.activePolls || 0} active`} icon={Flower2} tone="petal" />
        <StatCard label="Votes" value={polls.totalVotes} helper={`${polls.averageVotesPerPoll || 0} avg`} icon={Vote} tone="leaf" />
        <StatCard label="Quizzes" value={quizzes.totalQuizzes} helper={`${quizzes.publishedQuizzes || 0} published`} icon={ClipboardCheck} tone="tide" />
        <StatCard label="Pass rate" value={`${quizzes.passRate || 0}%`} helper={`${quizzes.totalAttempts || 0} attempts`} icon={BarChart3} tone="nectar" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="petal-card p-5">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-petal-700" />
            <h2 className="text-xl font-bold text-ink">Trending polls</h2>
          </div>
          <div className="space-y-4">
            {polls.trendingPolls?.length ? polls.trendingPolls.map((poll) => (
              <div key={poll._id} className="border border-leaf-100 bg-white/70 p-4" style={{ borderRadius: 8 }}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{poll.question}</p>
                    <p className="text-sm text-moss">{poll.recentVotes || 0} votes this week</p>
                  </div>
                  <span className="text-sm font-extrabold text-leaf-700">{poll.totalVotes || 0}</span>
                </div>
                <ProgressBar value={Math.min((poll.recentVotes || 0) * 10, 100)} tone="petal" />
              </div>
            )) : <p className="text-sm text-moss">Trending polls will appear after weekly vote activity.</p>}
          </div>
        </div>

        <div className="petal-card p-5">
          <h2 className="text-xl font-bold text-ink">Recent activity</h2>
          <div className="mt-5 space-y-4">
            {data?.activity?.length ? data.activity.map((item, index) => (
              <div key={`${item.type}-${index}`} className="flex gap-3">
                <div className="mt-1 h-3 w-3 shrink-0 bg-leaf-300" style={{ borderRadius: 8 }} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{item.title}</p>
                  <p className="text-xs text-moss">{activityLabel[item.type] || "Activity"} · {new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )) : <p className="text-sm text-moss">Recent activity will appear here.</p>}
          </div>
        </div>
      </section>

      <section className="petal-card p-5">
        <p className="label">Most voted polls</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {polls.mostVotedPolls?.map((poll) => (
            <div key={poll._id} className="border border-leaf-100 bg-white/70 p-4" style={{ borderRadius: 8 }}>
              <p className="line-clamp-2 font-bold text-ink">{poll.question}</p>
              <p className="mt-2 text-sm text-moss">{poll.category} · {poll.totalVotes || 0} votes</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
