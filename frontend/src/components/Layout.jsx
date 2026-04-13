import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout({ user, onLogout }) {
  const location = useLocation()

  const navItems = {
    student: { label: 'Student Portal', path: '/student', icon: '🎓' },
    employer: { label: 'Employer Portal', path: '/employer', icon: '🏢' },
    alumni: { label: 'Alumni Portal', path: '/alumni', icon: '🤝' },
    admin: { label: 'Admin Dashboard', path: '/admin', icon: '📊' },
  }

  const nav = user ? navItems[user.role] : null

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#F97316] opacity-[0.04] blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#14B8A6] opacity-[0.04] blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      {user && (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0f0f13]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to={nav?.path || '/'} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F97316]/30 to-[#14B8A6]/20 border border-white/10 flex items-center justify-center text-sm">
                CC
              </div>
              <span className="font-bold text-white tracking-tight">Cohort Connect</span>
              <span className="text-xs text-white/30 hidden sm:block">University of Bristol</span>
            </Link>

            <div className="flex items-center gap-4">
              {nav && (
                <Link
                  to={nav.path}
                  className={`text-sm px-4 py-1.5 rounded-full border transition-all duration-200 ${
                    location.pathname === nav.path
                      ? 'border-[#F97316]/50 text-[#F97316] bg-[#F97316]/10'
                      : 'border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {nav.icon} {nav.label}
                </Link>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/40 hidden sm:block">{user.name}</span>
                <button
                  onClick={onLogout}
                  className="text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className={`relative z-10 ${user ? 'pt-16' : ''}`}>
        <Outlet />
      </main>
    </div>
  )
}