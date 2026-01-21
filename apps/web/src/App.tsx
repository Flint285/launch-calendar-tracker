import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PageLayout } from './components/layout/PageLayout';
import { Login } from './routes/Login';
import { Plans } from './routes/Plans';
import { PlanNew } from './routes/PlanNew';
import { PlanDetail } from './routes/PlanDetail';
import { Calendar } from './routes/Calendar';
import { DayView } from './routes/DayView';
import { KpiDashboard } from './routes/KpiDashboard';
import { Report } from './routes/Report';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <PageLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/plans" replace />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/plans/new" element={<PlanNew />} />
                <Route path="/plans/:id" element={<PlanDetail />} />
                <Route path="/plans/:id/calendar" element={<Calendar />} />
                <Route path="/plans/:id/day/:date" element={<DayView />} />
                <Route path="/plans/:id/kpis" element={<KpiDashboard />} />
                <Route path="/plans/:id/report" element={<Report />} />
              </Routes>
            </PageLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
