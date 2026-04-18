import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import React, { useEffect, Suspense, lazy } from 'react'
import useAuthStore from './store/authStore'

import DashboardLayout from './components/layout/DashboardLayout'
import CookieConsent from './components/shared/CookieConsent'

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Browse = lazy(() => import('./pages/Browse'))
const Upload = lazy(() => import('./pages/Upload'))
const MyFiles = lazy(() => import('./pages/MyFiles'))
const Profile = lazy(() => import('./pages/Profile'))
const ResourceDetail = lazy(() => import('./pages/ResourceDetail'))
const Programs = lazy(() => import('./pages/Programs'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Terms = lazy(() => import('./pages/Terms'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
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
  useEffect(() => { fetchMe() }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e1b2e', color: '#fff', border: '1px solid #2a2740' },
          success: { iconTheme: { primary: '#6558f5', secondary: '#fff' } },
        }}
      />
      <CookieConsent />
      <Suspense fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard"        element={<Dashboard />} />
            <Route path="browse"           element={<Browse />} />
            <Route path="programs"         element={<Programs />} />
            <Route path="upload"           element={<Upload />} />
            <Route path="my-files"         element={<MyFiles />} />
            <Route path="profile"          element={<Profile />} />
            <Route path="resources/:id"    element={<ResourceDetail />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
