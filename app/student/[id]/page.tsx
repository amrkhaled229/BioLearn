// app/student/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  documentId,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  User,
  BookOpen,
  Activity,
  Mail,
  Phone,
  Edit,
  Save,
  LogOut,
} from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

type AssignedProgress = {
  id: string
  progress: number
  watchedVideos: number
  totalVideos: number
  readDocuments: number
  totalDocuments: number
  lastAccessed: string
}

type StudentDoc = {
  username: string
  fullName: string
  phoneNumber?: string
  status: string
  lastLogin?: string
  joinDate?: string
  assignedCourses: AssignedProgress[]
}

type CourseInfo = {
  id: string
  title: string
}

export default function StudentDetailPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const studentId = params.id

  const [student, setStudent] = useState<StudentDoc | null>(null)
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [loading, setLoading] = useState(true)

  // redirect non-admin
  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.replace("/")
    }
  }, [authLoading, user, router])

  // subscribe to student doc
  useEffect(() => {
    const ref = doc(db, "users", studentId)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          router.replace("/")
          return
        }
        setStudent(snap.data() as StudentDoc)
        setLoading(false)
      },
      (err) => {
        console.error("Error loading student:", err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [studentId, router])

  // fetch course titles
  useEffect(() => {
    if (!student) return
    const ids = student.assignedCourses.map((c) => c.id)
    if (ids.length === 0) {
      setCourses([])
      return
    }
    const q = query(
      collection(db, "courses"),
      where(documentId(), "in", ids.slice(0, 10))
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        const infos = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CourseInfo, "id">),
        }))
        // preserve order
        setCourses(ids.map((id) => infos.find((c) => c.id === id)!).filter(Boolean))
      },
      console.error
    )
    return () => unsub()
  }, [student])

  if (authLoading || loading) {
    return <LoadingSpinner />
  }
  if (!student) return null

  // helper to update student doc on "Save"
  const saveChanges = async (updates: Partial<StudentDoc>) => {
    await updateDoc(doc(db, "users", studentId), updates)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bio-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-white text-primary text-lg">
                {student.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {student.fullName}
              </h1>
              <p className="text-green-100 text-sm">@{student.username}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {student.assignedCourses.length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enrolled Courses
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {student.assignedCourses.length
                        ? Math.round(
                            student.assignedCourses.reduce(
                              (sum, c) => sum + c.progress,
                              0
                            ) / student.assignedCourses.length
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Progress</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {student.lastLogin || "—"}
                    </div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {student.joinDate || "—"}
                    </div>
                    <p className="text-sm text-muted-foreground">Join Date</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Edit */}
              <Card>
                <CardHeader>
                  <CardTitle>Edit Info</CardTitle>
                  <CardDescription>Update name or status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={student.fullName}
                      onChange={(e) =>
                        setStudent({ ...student, fullName: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border rounded"
                    />
                    <select
                      value={student.status}
                      onChange={(e) =>
                        setStudent({ ...student, status: e.target.value })
                      }
                      className="px-3 py-2 border rounded"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <Button
                      variant="outline"
                      onClick={() =>
                        saveChanges({
                          fullName: student.fullName,
                          status: student.status,
                        })
                      }
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-4">
              {student.assignedCourses.map((ac) => {
                const info = courses.find((c) => c.id === ac.id)
                return (
                  <Card key={ac.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {info?.title || ac.id}
                        <Badge variant="secondary">{ac.progress}%</Badge>
                      </CardTitle>
                      <CardDescription>
                        Last accessed: {ac.lastAccessed}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{ac.progress}%</span>
                      </div>
                      <Progress value={ac.progress} className="h-2" />
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Activity Log</CardTitle>
                  <CardDescription>
                    Coming soon: full activity tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8 text-muted-foreground">
                  Activity tracking is on the roadmap...
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={
                  student.status === "active" ? "default" : "secondary"
                }>
                  {student.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Username</span>
                <span className="text-sm font-medium">@{student.username}</span>
              </div>
              {student.phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="text-sm font-medium">{student.phoneNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Phone className="h-4 w-4 mr-2" />
                Send SMS
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BookOpen className="h-4 w-4 mr-2" />
                Assign Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
