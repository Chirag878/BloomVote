import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Trophy, Vote } from "lucide-react";
import pollsApi from "../../api/polls.js";
import Button from "../../components/ui/Button.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { ErrorState, LoadingState } from "../../components/ui/StateBlock.jsx";
import { useAsync } from "../../hooks/useAsync.js";

const PollAnalyticsPage = () => {
  const { pollId } = useParams();
  const { data, loading, error } = useAsync(() => pollsApi.analytics(pollId), [pollId]);

  if (loading) return <LoadingState label="Reading poll analytics" />;
  if (error) return <ErrorState message={error} />;

  const analytics = data?.data;
  const summary = analytics?.summary || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link to={`/polls/${pollId}`} className="inline-flex items-center gap-2 text-sm font-bold text-moss hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Back to poll
          </Link>
          <h1 className="section-title mt-3">{analytics?.poll?.question}</h1>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total votes" value={summary.totalVotes} icon={Vote} tone="petal" />
        <StatCard label="Unique voters" value={summary.uniqueVoters} icon={Trophy} tone="leaf" />
        <StatCard label="Peak hour" value={summary.totalVotes ? analytics.peakHour?.label || "N/A" : "N/A"} helper={`${analytics.peakHour?.votes || 0} votes`} icon={Clock} tone="tide" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="petal-card p-5">
          <p className="label">Option ranking</p>
          <div className="mt-5 space-y-4">
            {analytics?.options?.map((option) => (
              <div key={option._id} className="border border-leaf-100 bg-white/70 p-4" style={{ borderRadius: 8 }}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-bold text-ink">{option.rank}. {option.text}</p>
                  <p className="text-sm font-extrabold text-moss">{option.voteCount} votes</p>
                </div>
                <ProgressBar value={option.percentage} tone={option.isLeading ? "petal" : "leaf"} />
              </div>
            ))}
          </div>
        </div>

        <div className="petal-card p-5">
          <p className="label">Daily vote trend</p>
          <div className="mt-5 space-y-4">
            {analytics?.votingTrends?.length ? analytics.votingTrends.map((item) => (
              <div key={item.date}>
                <div className="mb-2 flex justify-between text-sm font-bold text-moss">
                  <span>{item.date}</span>
                  <span>{item.votes}</span>
                </div>
                <ProgressBar value={Math.min(item.votes * 10, 100)} tone="tide" />
              </div>
            )) : <p className="text-sm text-moss">Vote trends will appear after activity begins.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PollAnalyticsPage;
