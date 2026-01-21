import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, LayoutDashboard, LogOut, ChevronRight, BarChart3, FileText } from 'lucide-react';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract plan ID from path if present
  const planIdMatch = location.pathname.match(/\/plans\/(\d+)/);
  const planId = planIdMatch ? planIdMatch[1] : null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Link to="/plans" className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary-600" />
                <span className="font-semibold text-lg text-gray-900">Launch Tracker</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Plan navigation (when viewing a plan) */}
      {planId && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 h-12 text-sm">
              <Link to="/plans" className="text-gray-500 hover:text-gray-700">
                Plans
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center gap-4">
                <NavLink
                  to={`/plans/${planId}`}
                  active={location.pathname === `/plans/${planId}`}
                  icon={<LayoutDashboard className="h-4 w-4" />}
                >
                  Overview
                </NavLink>
                <NavLink
                  to={`/plans/${planId}/calendar`}
                  active={location.pathname.includes('/calendar') || location.pathname.includes('/day/')}
                  icon={<Calendar className="h-4 w-4" />}
                >
                  Calendar
                </NavLink>
                <NavLink
                  to={`/plans/${planId}/kpis`}
                  active={location.pathname.includes('/kpis')}
                  icon={<BarChart3 className="h-4 w-4" />}
                >
                  KPIs
                </NavLink>
                <NavLink
                  to={`/plans/${planId}/report`}
                  active={location.pathname.includes('/report')}
                  icon={<FileText className="h-4 w-4" />}
                >
                  Report
                </NavLink>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  to,
  active,
  icon,
  children,
}: {
  to: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
