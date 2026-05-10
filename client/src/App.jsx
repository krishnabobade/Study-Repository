import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import React, { useEffect, Suspense, lazy } from 'react'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'
import { SkeletonText, SkeletonTitle, SkeletonAvatar } from './components/shared/Skeleton.jsx'

import DashboardLayout from './components/layout/DashboardLayout'
import CookieConsent from './components/shared/CookieConsent'

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Browse = lazy(() => import('./pages/Browse'))
const Upload = lazy(() => import('./pages/Upload'))
const MyFiles = lazy(() => import('./pages/MyFiles'))
const Profile = lazy(() => import('./pages/Profile'))
const PublicProfile = lazy(() => import('./pages/PublicProfile'))
const ResourceDetail = lazy(() => import('./pages/ResourceDetail'))
const Programs = lazy(() => import('./pages/Programs'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Terms = lazy(() => import('./pages/Terms'))
const ParallaxDemo = lazy(() => import('./pages/ParallaxDemo'))
const NotFound = lazy(() => import('./pages/NotFound'))
const HelpCenter = lazy(() => import('./pages/HelpCenter'))
const BugReport = lazy(() => import('./pages/BugReport'))
const FeedbackList = lazy(() => import('./pages/FeedbackList'))
const Assignments = lazy(() => import('./pages/Assignments'))

// Admin Pages
const UserManagement = lazy(() => import('./pages/admin/UserManagement'))
const ResourceManagement = lazy(() => import('./pages/admin/ResourceManagement'))
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'))

function GlobalLoading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-pulse">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-panel" />
          <SkeletonTitle width="150px" />
          <SkeletonText lines={1} className="w-[200px]" />
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-panel rounded-xl" />
          <div className="h-12 bg-panel rounded-xl" />
          <div className="h-12 bg-ink-500/20 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <GlobalLoading />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return null
  if (!user || user.role !== 'super_admin') return <Navigate to="/dashboard" replace />
  return children
}



function PublicRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe)
  const initTheme = useThemeStore(s => s.initTheme)
  const mode = useThemeStore(s => s.mode)

  useEffect(() => { 
    fetchMe()
    initTheme()
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { 
            background: mode === 'dark' ? '#1e1b2e' : '#ffffff', 
            color: mode === 'dark' ? '#fff' : '#1e293b', 
            border: mode === 'dark' ? '1px solid #2a2740' : '1px solid #e2e8f0' 
          },
          success: { iconTheme: { primary: '#6558f5', secondary: '#fff' } },
        }}
      />
      <CookieConsent />
      <Suspense fallback={<GlobalLoading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/demo" element={<ParallaxDemo />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard"        element={<Dashboard />} />
            <Route path="browse"           element={<Browse />} />
            <Route path="programs"         element={<Programs />} />
            <Route path="upload"           element={<Upload />} />
            <Route path="my-files"         element={<MyFiles />} />
            <Route path="profile"          element={<Profile />} />
            <Route path="profile/:id"      element={<PublicProfile />} />
            <Route path="resources/:id"    element={<ResourceDetail />} />
            <Route path="help"             element={<HelpCenter />} />
            <Route path="bug-report"       element={<BugReport />} />
            <Route path="feedback"         element={<AdminRoute><FeedbackList /></AdminRoute>} />
            <Route path="assignments"      element={<Assignments />} />

            {/* Admin Only Routes */}
            <Route path="admin/users"      element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="admin/resources"  element={<AdminRoute><ResourceManagement /></AdminRoute>} />
            <Route path="admin/logs"       element={<AdminRoute><AuditLogs /></AdminRoute>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
