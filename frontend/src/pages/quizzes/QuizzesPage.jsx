import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import quizzesApi from "../../api/quizzes.js";
import Button from "../../components/ui/Button.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/StateBlock.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import QuizCard from "./QuizCard.jsx";

const categories = ["", "General", "Technology", "Entertainment", "Sports", "Politics", "Health", "Education", "Other"];

const QuizzesPage = () => {
  const [tab, setTab] = useState("published");
  const [filters, setFilters] = useState({ search: "", category: "" });
  const fetcher = () => (tab === "mine" ? quizzesApi.mine(filters) : quizzesApi.list(filters));
  const { data, loading, error, execute } = useAsync(fetcher, [tab, filters], false);

  useEffect(() => {
    const timer = window.setTimeout(() => execute(), 250);
    return () => window.clearTimeout(timer);
  }, [execute, filters, tab]);

  const quizzes = data?.data || [];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="label">Quizzes</p>
          <h1 className="section-title mt-2">Learning petals</h1>
        </div>
        <Link to="/quizzes/new"><Button icon={Plus}>Create quiz</Button></Link>
      </section>

      <section className="shell-panel space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            ["published", "Published"],
            ["mine", "My quizzes"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`px-4 py-2 text-sm font-bold transition ${tab === value ? "bg-ink text-white" : "bg-white/70 text-moss hover:text-ink"}`}
              style={{ borderRadius: 8 }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-moss" />
            <input
              className="field pl-10"
              placeholder="Search quizzes"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </label>
          <select className="field" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
            {categories.map((category) => <option key={category} value={category}>{category || "All categories"}</option>)}
          </select>
        </div>
      </section>

      {loading ? <LoadingState label="Loading quizzes" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes found"
          message="Create a quiz or adjust the filters."
          action={<Link to="/quizzes/new"><Button icon={Plus}>Create quiz</Button></Link>}
        />
      ) : null}
      {!loading && !error && quizzes.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => <QuizCard key={quiz._id} quiz={quiz} />)}
        </section>
      ) : null}
    </div>
  );
};

export default QuizzesPage;
