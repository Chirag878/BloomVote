import { Sprout } from "lucide-react";

const AuthLayout = ({ children, title, subtitle }) => (
  <main className="min-h-screen bg-blossom-field px-4 py-8">
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden lg:block">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 border border-white/70 bg-white/65 px-3 py-2 text-sm font-bold text-leaf-700 shadow-soft backdrop-blur" style={{ borderRadius: 8 }}>
            <Sprout className="h-4 w-4" />
            BloomVote
          </div>
          <h1 className="mt-8 font-display text-6xl font-bold leading-tight text-ink">
            Polls and quizzes with a calmer pulse.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-moss">
            Create, vote, learn, and read the room through analytics that feel clear without feeling clinical.
          </p>
        </div>
      </section>
      <section className="shell-panel mx-auto w-full max-w-md p-6 sm:p-8">
        <div className="mb-8">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center bg-leaf-50 text-leaf-700" style={{ borderRadius: 8 }}>
            <Sprout className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl font-bold text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-moss">{subtitle}</p>
        </div>
        {children}
      </section>
    </div>
  </main>
);

export default AuthLayout;
