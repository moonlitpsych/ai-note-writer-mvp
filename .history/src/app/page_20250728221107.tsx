import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}