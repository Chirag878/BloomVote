import { useEffect, useState } from "react";
import { Save, User } from "lucide-react";
import authApi from "../../api/auth.js";
import quizzesApi from "../../api/quizzes.js";
import votesApi from "../../api/votes.js";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import { ErrorState, LoadingState } from "../../components/ui/StateBlock.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage, useAsync } from "../../hooks/useAsync.js";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ userName: user?.userName || "", avatar: user?.avatar || "" });
  const [saving, setSaving] = useState(false);
  const historyState = useAsync(async () => {
    const [votes, attempts] = await Promise.all([
      votesApi.myHistory({ limit: 6 }),
      quizzesApi.attempts({ limit: 6 }),
    ]);
    return { votes: votes.data, attempts: attempts.data };
  }, []);

  useEffect(() => {
    setForm({ userName: user?.userName || "", avatar: user?.avatar || "" });
  }, [user]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await authApi.updateProfile(form);
      updateUser(response.data);
      showToast({ type: "success", title: "Profile updated" });
    } catch (err) {
      showToast({ type: "error", title: "Update failed", message: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (historyState.loading) return <LoadingState label="Loading profile" />;
  if (historyState.error) return <ErrorState message={historyState.error} />;

  const votes = historyState.data?.votes || [];
  const attempts = historyState.data?.attempts || [];

  return (
    <div className="space-y-6">
      <section>
        <p className="label">Profile</p>
        <h1 className="section-title mt-2">Your workspace identity</h1>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form className="shell-panel space-y-5 p-5 md:p-7" onSubmit={saveProfile}>
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center bg-petal-50 text-petal-700" style={{ borderRadius: 8 }}>
              {form.avatar ? <img src={form.avatar} alt="" className="h-full w-full object-cover" style={{ borderRadius: 8 }} /> : <User className="h-8 w-8" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-ink">{user?.userName}</p>
              <p className="truncate text-sm text-moss">{user?.email}</p>
            </div>
          </div>
          <FormField label="Username" value={form.userName} onChange={(event) => setForm((current) => ({ ...current, userName: event.target.value }))} />
          <FormField label="Avatar URL" value={form.avatar} onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))} />
          <Button type="submit" icon={Save} disabled={saving}>{saving ? "Saving" : "Save profile"}</Button>
        </form>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="petal-card p-5">
            <p className="label">Recent votes</p>
            <div className="mt-4 space-y-3">
              {votes.length ? votes.map((vote) => (
                <div key={vote._id} className="border border-leaf-100 bg-white/70 p-3" style={{ borderRadius: 8 }}>
                  <p className="line-clamp-2 text-sm font-bold text-ink">{vote.poll?.question || "Poll unavailable"}</p>
                  <p className="mt-1 text-xs text-moss">{new Date(vote.createdAt).toLocaleString()}</p>
                </div>
              )) : <p className="text-sm text-moss">Vote history will appear here.</p>}
            </div>
          </div>

          <div className="petal-card p-5">
            <p className="label">Quiz attempts</p>
            <div className="mt-4 space-y-3">
              {attempts.length ? attempts.map((attempt) => (
                <div key={attempt._id} className="border border-leaf-100 bg-white/70 p-3" style={{ borderRadius: 8 }}>
                  <p className="line-clamp-2 text-sm font-bold text-ink">{attempt.quiz?.title || "Quiz unavailable"}</p>
                  <p className="mt-1 text-xs text-moss">Score {attempt.score} · {attempt.passed ? "Passed" : "Not passed"}</p>
                </div>
              )) : <p className="text-sm text-moss">Quiz attempts will appear here.</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
