import { Link } from "react-router-dom";
import { BarChart3, Clock, Vote } from "lucide-react";
import ProgressBar from "../../components/ui/ProgressBar.jsx";

const PollCard = ({ poll }) => {
  const leading = [...(poll.options || [])].sort((a, b) => b.voteCount - a.voteCount)[0];
  const expiresAt = poll.expiresAt ? new Date(poll.expiresAt) : null;

  return (
    <article className="petal-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="bg-leaf-50 px-2.5 py-1 text-xs font-bold text-leaf-700" style={{ borderRadius: 8 }}>
          {poll.category}
        </span>
        <span className={`px-2.5 py-1 text-xs font-bold ${poll.isActive ? "bg-tide-50 text-tide-600" : "bg-petal-50 text-petal-700"}`} style={{ borderRadius: 8 }}>
          {poll.isActive ? "Active" : "Closed"}
        </span>
      </div>
      <h2 className="mt-4 line-clamp-2 text-xl font-bold leading-snug text-ink">{poll.question}</h2>
      <p className="mt-2 text-sm text-moss">
        {poll.creator?.userName || "Unknown creator"} · {poll.totalVotes || 0} votes
      </p>

      <div className="mt-5 space-y-3">
        {poll.options?.slice(0, 3).map((option) => (
          <div key={option._id}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold text-moss">
              <span className="truncate">{option.text}</span>
              <span>{option.percentage ?? (poll.totalVotes ? Math.round((option.voteCount / poll.totalVotes) * 100) : 0)}%</span>
            </div>
            <ProgressBar value={option.percentage ?? (poll.totalVotes ? (option.voteCount / poll.totalVotes) * 100 : 0)} tone={leading?._id === option._id ? "petal" : "leaf"} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-moss">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {expiresAt ? expiresAt.toLocaleDateString() : "No expiry"}
        </span>
        <div className="flex gap-2">
          <Link className="inline-flex items-center gap-1.5 font-bold text-leaf-700 hover:text-ink" to={`/polls/${poll._id}`}>
            <Vote className="h-4 w-4" />
            Vote
          </Link>
          <Link className="inline-flex items-center gap-1.5 font-bold text-petal-700 hover:text-ink" to={`/polls/${poll._id}/analytics`}>
            <BarChart3 className="h-4 w-4" />
            Stats
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PollCard;
