import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import PollsPage from "./pages/polls/PollsPage.jsx";
import PollCreatePage from "./pages/polls/PollCreatePage.jsx";
import PollDetailPage from "./pages/polls/PollDetailPage.jsx";
import PollAnalyticsPage from "./pages/polls/PollAnalyticsPage.jsx";
import QuizzesPage from "./pages/quizzes/QuizzesPage.jsx";
import QuizCreatePage from "./pages/quizzes/QuizCreatePage.jsx";
import QuizDetailPage from "./pages/quizzes/QuizDetailPage.jsx";
import QuizAttemptPage from "./pages/quizzes/QuizAttemptPage.jsx";
import QuizAnalyticsPage from "./pages/quizzes/QuizAnalyticsPage.jsx";
import AnalyticsPage from "./pages/analytics/AnalyticsPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      element={(
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      )}
    >
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/polls" element={<PollsPage />} />
      <Route path="/polls/new" element={<PollCreatePage />} />
      <Route path="/polls/:pollId" element={<PollDetailPage />} />
      <Route path="/polls/:pollId/analytics" element={<PollAnalyticsPage />} />
      <Route path="/quizzes" element={<QuizzesPage />} />
      <Route path="/quizzes/new" element={<QuizCreatePage />} />
      <Route path="/quizzes/:quizId" element={<QuizDetailPage />} />
      <Route path="/quizzes/:quizId/attempt" element={<QuizAttemptPage />} />
      <Route path="/quizzes/:quizId/analytics" element={<QuizAnalyticsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
