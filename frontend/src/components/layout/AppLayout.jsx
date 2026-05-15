import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  Flower2,
  LayoutDashboard,
  LogOut,
  Plus,
  Sprout,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Button from "../ui/Button.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/polls", label: "Polls", icon: Flower2 },
  { to: "/quizzes", label: "Quizzes", icon: ClipboardList },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast({ type: "success", title: "Signed out" });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-blossom-field">
      <aside className="fixed left-4 top-4 z-30 hidden h-[calc(100vh-2rem)] w-72 flex-col shell-panel p-4 lg:flex">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid h-11 w-11 place-items-center bg-leaf-50 text-leaf-700" style={{ borderRadius: 8 }}>
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-ink">BloomVote</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Live insight</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-3 text-sm font-bold transition ${isActive ? "bg-ink text-white shadow-petal" : "text-moss hover:bg-white/75 hover:text-ink"}`}
                style={{ borderRadius: 8 }}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="soft-divider pt-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="grid h-10 w-10 place-items-center bg-petal-50 text-petal-700" style={{ borderRadius: 8 }}>
              {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" style={{ borderRadius: 8 }} /> : <User className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{user?.userName}</p>
              <p className="truncate text-xs text-moss">{user?.email}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" icon={LogOut} className="w-full" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-xl font-bold text-ink">
            <Sprout className="h-5 w-5 text-leaf-700" />
            BloomVote
          </div>
          <Button type="button" icon={Plus} onClick={() => navigate("/polls/new")}>
            New
          </Button>
        </div>
      </header>

      <main className="px-4 pb-24 pt-5 lg:ml-80 lg:px-8 lg:pb-10 lg:pt-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-5 gap-1 shell-panel p-2 lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `grid min-h-12 place-items-center text-xs font-bold transition ${isActive ? "bg-ink text-white" : "text-moss hover:bg-leaf-50 hover:text-ink"}`}
              style={{ borderRadius: 8 }}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
