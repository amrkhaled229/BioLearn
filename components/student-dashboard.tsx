// components/student-dashboard.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LogOut,
  PlayCircle,
  FileText,
  Clock,
  Dna,
  BookOpen,
  Award,
} from "lucide-react"
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  documentId,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

type Course = {
  id: string
  title: string
  description: string
  coverImage: string
  progress?: number
  totalVideos?: number
  watchedVideos?: number
  totalDocuments?: number
  readDocuments?: number
  lastAccessed?: string
}

export function StudentDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const [assignedCourseIds, setAssignedCourseIds] = useState<string[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  // 1️⃣ Listen for changes to this student's user doc to get assignedCourses
  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, "users", user.id), (snap) => {
      const data = snap.data()
      setAssignedCourseIds(Array.isArray(data?.assignedCourses) ? data.assignedCourses : [])
    })
    return () => unsub()
  }, [user])

  // 2️⃣ Once we have assignedCourseIds, fetch those course docs
  useEffect(() => {
    if (assignedCourseIds.length === 0) {
      setCourses([])
      return
    }
    // Firestore "in" queries only allow up to 10 items—adjust if needed
    const q = query(
      collection(db, "courses"),
      where(documentId(), "in", assignedCourseIds)
    )
    const unsub = onSnapshot(q, (snap) => {
      setCourses(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Course, "id">),
        }))
      )
    })
    return () => unsub()
  }, [assignedCourseIds])

  // Compute aggregates (defaulting missing values to 0)
  const totalCount = courses.length
  const totalProgress = totalCount
    ? Math.round(
        courses.reduce((sum, c) => sum + (c.progress ?? 0), 0) / totalCount
      )
    : 0
  const totalWatched = courses.reduce((sum, c) => sum + (c.watchedVideos ?? 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bio-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Dna className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">BioLearn</h1>
                <p className="text-green-100 text-sm">
                  Welcome back, {user?.fullName}
                </p>
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {totalCount}
              </div>
              <p className="text-xs text-muted-foreground">Enrolled Courses</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {totalProgress}%
              </div>
              <p className="text-xs text-muted-foreground">Overall Progress</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalWatched}
              </div>
              <p className="text-xs text-muted-foreground">Videos Watched</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">My Courses</h2>
            <p className="text-muted-foreground">
              Continue your biology learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-video relative">
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/50 text-white">
                      {`${(course.progress ?? 0)}% Complete`}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      className="bio-gradient"
                      onClick={() => router.push(`/course/${course.id}`)}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  </div>
                </div>

                <CardContent className="space-y-4">
                  <h3 className="font-semibold">{course.title}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{`${(course.progress ?? 0)}%`}</span>
                    </div>
                    <Progress value={course.progress ?? 0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-blue-500" />
                      <span>
                        {`${(course.watchedVideos ?? 0)}/${
                          (course.totalVideos ?? 0)
                        } videos`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span>
                        {`${(course.readDocuments ?? 0)}/${
                          (course.totalDocuments ?? 0)
                        } docs`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last accessed:{" "}
                    {course.lastAccessed
                      ? new Date(course.lastAccessed).toLocaleDateString()
                      : ""}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
