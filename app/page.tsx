"use client"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { StudentDashboard } from "@/components/student-dashboard"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <LoginForm />
  }

  return user.role === "admin" ? <AdminDashboard /> : <StudentDashboard />
}
