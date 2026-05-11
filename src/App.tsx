import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { LoadingState } from './components/LoadingState';
import { useAuth } from './context/AuthContext';
import { LoginPage, SignupPage } from './pages/AuthPage';
import { ChallengeDetailPage } from './pages/ChallengeDetailPage';
import { ChallengeListPage } from './pages/ChallengeListPage';
import { CreatePage } from './pages/CreatePage';
import { DashboardPage } from './pages/DashboardPage';
import { JoinPage } from './pages/JoinPage';
import { ProfilePage } from './pages/ProfilePage';

function ProtectedRoute() {
  const { profile, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (!profile) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/challenges" element={<ChallengeListPage type="group" />} />
        <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
        <Route path="/self" element={<ChallengeListPage type="self" />} />
        <Route path="/self/:id" element={<ChallengeDetailPage selfOnly />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
