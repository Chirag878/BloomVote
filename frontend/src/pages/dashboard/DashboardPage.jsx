import { Link } from "react-router-dom";
import { BarChart3, ClipboardCheck, Flower2, Users, Vote } from "lucide-react";
import analyticsApi from "../../api/analytics.js";
import Button from "../../components/ui/Button.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/StateBlock.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAsync } from "../../hooks/useAsync.js";

const activityLabel = {
  poll_created: "Poll created",
  vote_cast: "Vote cast",
  quiz_created: "Quiz created",
  quiz_attempt: "Quiz attempt",
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, loading, error } = useAsync(() => analyticsApi.dashboard(), []);

  if (loading) return <LoadingState label="Growing dashboard" />;
  if (error) return <ErrorState message={error} />;

  const dashboard = data?.data;
  const totals = dashboard?.totals || {};
  const mine = dashboard?.mine || {};
  const engagement = dashboard?.engagement || {};

  return (
    <div className="space-y-6">
      <section className="shell-panel overflow-hidden p-6 md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="label">Good to see you, {user?.userName}</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
              Your live opinion garden.
            </h1>
            <p className="mt-3 max-w-2xl text-moss">
              Polls, votes, quizzes, attempts, and the latest activity are gathered into one calm view.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/polls/new"><Button icon={Flower2}>New poll</Button></Link>
            <Link to="/quizzes/new"><Button variant="secondary" icon={ClipboardCheck}>New quiz</Button></Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total polls" value={totals.totalPolls} helper={`${totals.activePolls || 0} active`} icon={Flower2} tone="petal" />
        <StatCard label="Total votes" value={totals.totalVotes} helper={`${engagement.averageVotesPerPoll || 0} avg per poll`} icon={Vote} tone="leaf" />
        <StatCard label="Quizzes" value={totals.totalQuizzes} helper={`${totals.totalAttempts || 0} attempts`} icon={ClipboardCheck} tone="tide" />
        <StatCard label="Members" value={totals.totalUsers} helper={`${totals.passRate || 0}% quiz pass rate`} icon={Users} tone="nectar" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="petal-card p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="label">Trending this week</p>
              <h2 className="mt-2 text-xl font-bold text-ink">Poll momentum</h2>
            </div>
            <Link className="text-sm font-bold text-petal-700 hover:text-ink" to="/analytics">Open analytics</Link>
          </div>
          <div className="space-y-4">
            {dashboard?.trendingPolls?.length ? dashboard.trendingPolls.map((poll) => (
              <Link key={poll._id} to={`/polls/${poll._id}`} className="block border border-leaf-100 bg-white/75 p-4 transition hover:border-leaf-300" style={{ borderRadius: 8 }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{poll.question}</p>
                    <p className="mt-1 text-sm text-moss">{poll.category} · {poll.recentVotes} recent votes</p>
                  </div>
                  <span className="shrink-0 text-sm font-extrabold text-leaf-700">{poll.totalVotes}</span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={Math.min((poll.recentVotes || 0) * 10, 100)} tone="petal" />
                </div>
              </Link>
            )) : <EmptyState title="No trending polls yet" message="Vote activity from the last week will appear here." />}
          </div>
        </div>

        <div className="space-y-6">
          <div className="petal-card p-5">
            <p className="label">Your activity</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Polls", mine.polls],
                ["Votes", mine.votes],
                ["Quizzes", mine.quizzes],
                ["Attempts", mine.attempts],
              ].map(([label, value]) => (
                <div key={label} className="border border-leaf-100 bg-white/70 p-4" style={{ borderRadius: 8 }}>
                  <p className="text-2xl font-extrabold text-ink">{value || 0}</p>
                  <p className="mt-1 text-sm font-semibold text-moss">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="petal-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-leaf-700" />
              <h2 className="text-xl font-bold text-ink">Recent activity</h2>
            </div>
            <div className="space-y-3">
              {dashboard?.recentActivity?.length ? dashboard.recentActivity.slice(0, 6).map((item, index) => (
                <div key={`${item.type}-${item.resourceId}-${index}`} className="flex gap-3">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 bg-petal-300" style={{ borderRadius: 8 }} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{item.title}</p>
                    <p className="text-xs text-moss">{activityLabel[item.type]} · {new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-moss">Recent events will appear here.</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
