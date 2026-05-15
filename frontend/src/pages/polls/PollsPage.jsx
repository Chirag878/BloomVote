import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import pollsApi from "../../api/polls.js";
import Button from "../../components/ui/Button.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/StateBlock.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import PollCard from "./PollCard.jsx";

const categories = ["", "General", "Technology", "Entertainment", "Sports", "Politics", "Health", "Education", "Other"];

const PollsPage = () => {
  const [filters, setFilters] = useState({ search: "", category: "", sort: "newest" });
  const { data, loading, error, execute } = useAsync(() => pollsApi.list(filters), [filters], false);

  useEffect(() => {
    const timer = window.setTimeout(() => execute(), 250);
    return () => window.clearTimeout(timer);
  }, [filters, execute]);

  const polls = data?.data || [];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="label">Polls</p>
          <h1 className="section-title mt-2">Live questions</h1>
        </div>
        <Link to="/polls/new"><Button icon={Plus}>Create poll</Button></Link>
      </section>

      <section className="shell-panel grid gap-3 p-4 md:grid-cols-[1fr_220px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-moss" />
          <input
            className="field pl-10"
            placeholder="Search polls"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
        </label>
        <select className="field" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
          {categories.map((category) => <option key={category} value={category}>{category || "All categories"}</option>)}
        </select>
        <select className="field" value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}>
          <option value="newest">Newest</option>
          <option value="popular">Most voted</option>
          <option value="endingSoon">Ending soon</option>
          <option value="oldest">Oldest</option>
        </select>
      </section>

      {loading ? <LoadingState label="Loading polls" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && polls.length === 0 ? (
        <EmptyState
          title="No polls found"
          message="Create the first question or adjust the filters."
          action={<Link to="/polls/new"><Button icon={Plus}>Create poll</Button></Link>}
        />
      ) : null}
      {!loading && !error && polls.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {polls.map((poll) => <PollCard key={poll._id} poll={poll} />)}
        </section>
      ) : null}
    </div>
  );
};

export default PollsPage;
