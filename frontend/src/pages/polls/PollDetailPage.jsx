import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BarChart3, CheckCircle2, Vote } from "lucide-react";
import pollsApi from "../../api/polls.js";
import votesApi from "../../api/votes.js";
import Button from "../../components/ui/Button.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import { ErrorState, LoadingState } from "../../components/ui/StateBlock.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage, useAsync } from "../../hooks/useAsync.js";

const PollDetailPage = () => {
  const { pollId } = useParams();
  const { showToast } = useToast();
  const [selectedOption, setSelectedOption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pollState = useAsync(() => pollsApi.get(pollId), [pollId]);
  const voteState = useAsync(() => votesApi.myPollVote(pollId).catch(() => ({ data: [] })), [pollId]);

  const poll = pollState.data?.data;
  const votedOptionIds = useMemo(() => new Set((voteState.data?.data || []).map((vote) => vote.optionId)), [voteState.data]);
  const hasVoted = votedOptionIds.size > 0;

  const handleVote = async () => {
    if (!selectedOption) {
      showToast({ type: "warning", title: "Choose an option first" });
      return;
    }
    setSubmitting(true);
    try {
      await votesApi.cast({ pollId, optionId: selectedOption });
      showToast({ type: "success", title: "Vote recorded" });
      await Promise.all([pollState.execute(), voteState.execute()]);
      setSelectedOption("");
    } catch (err) {
      showToast({ type: "error", title: "Vote failed", message: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (pollState.loading) return <LoadingState label="Loading poll" />;
  if (pollState.error) return <ErrorState message={pollState.error} />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="shell-panel p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="bg-leaf-50 px-3 py-1 text-xs font-bold text-leaf-700" style={{ borderRadius: 8 }}>{poll.category}</span>
          <Link to={`/polls/${poll._id}/analytics`}>
            <Button variant="secondary" icon={BarChart3}>Analytics</Button>
          </Link>
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-ink">{poll.question}</h1>
        <p className="mt-3 text-moss">
          {poll.creator?.userName || "Unknown creator"} · {poll.totalVotes || 0} votes · {poll.isActive ? "Active" : "Closed"}
        </p>
      </section>

      <section className="grid gap-4">
        {poll.options?.map((option) => {
          const percentage = option.percentage ?? (poll.totalVotes ? (option.voteCount / poll.totalVotes) * 100 : 0);
          const voted = votedOptionIds.has(option._id);
          const selected = selectedOption === option._id;

          return (
            <button
              type="button"
              key={option._id}
              onClick={() => setSelectedOption(option._id)}
              disabled={!poll.isActive || voted || (!poll.allowsMultipleVotes && hasVoted)}
              className={`petal-card w-full p-5 text-left ${selected ? "ring-4 ring-leaf-100" : ""}`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center border ${selected || voted ? "border-leaf-500 bg-leaf-500 text-white" : "border-leaf-200 bg-white"}`} style={{ borderRadius: 8 }}>
                    {selected || voted ? <CheckCircle2 className="h-4 w-4" /> : null}
                  </span>
                  <span className="truncate font-bold text-ink">{option.text}</span>
                </div>
                <span className="shrink-0 text-sm font-extrabold text-moss">{option.voteCount} votes</span>
              </div>
              <ProgressBar value={percentage} tone={voted ? "petal" : "leaf"} />
              <p className="mt-2 text-right text-xs font-bold text-moss">{Number(percentage).toFixed(1)}%</p>
            </button>
          );
        })}
      </section>

      <div className="flex justify-end">
        <Button icon={Vote} disabled={!poll.isActive || submitting || (!poll.allowsMultipleVotes && hasVoted)} onClick={handleVote}>
          {submitting ? "Submitting" : "Cast vote"}
        </Button>
      </div>
    </div>
  );
};

export default PollDetailPage;
