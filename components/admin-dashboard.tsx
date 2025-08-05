// components/admin-dashboard.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, Plus, LogOut, Search, BarChart3, Dna, Microscope, Leaf, UserPlus } from "lucide-react"
import { CourseManager, Course } from "./course-manager"
import { StudentManager, Student } from "./student-manager"
import { Input } from "@/components/ui/input"
import { CourseEditModal } from "./course-edit-modal"
import { StudentEditModal } from "./student-edit-modal"
import { DeleteConfirmModal } from "./delete-confirm-modal"
import { CourseCreationModal } from "./course-creation-modal"
import { StudentCreationModal } from "./student-creation-modal"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  type TabKey = "overview" | "courses" | "students" | "analytics"
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // Courses state
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])

  // Students state
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])

  // Modals state
  const [showCourseCreation, setShowCourseCreation] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)

  const [showStudentCreation, setShowStudentCreation] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)

  // Subscribe to courses collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "courses"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Course, "id">),
      })) as Course[]
      setCourses(data)
    })
    return () => unsub()
  }, [])

  // Subscribe to students (users where role == "student")
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "student"))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => {
        const dt = d.data() as any
        return {
          id: d.id,
          username: dt.username,
          fullName: dt.fullName,
          phoneNumber: dt.phoneNumber,
          assignedCourses: dt.assignedCourses || [],
          lastLogin: dt.lastLogin,
          status: dt.status,
          notifications: dt.notifications,
        } as Student
      })
      setStudents(data)
    })
    return () => unsub()
  }, [])

  // Filter courses by searchTerm
  useEffect(() => {
    setFilteredCourses(
      courses.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, courses])

  // Filter students by searchTerm
  useEffect(() => {
    setFilteredStudents(
      students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, students])

  // Handlers for course CRUD
  const createCourse = async (newCourse: Course) => {
    const { id, ...rest } = newCourse
    await addDoc(collection(db, "courses"), { ...rest, createdAt: serverTimestamp() })
    setShowCourseCreation(false)
  }
  const updateCourse = async (updated: Course) => {
    const { id, ...rest } = updated
    await updateDoc(doc(db, "courses", id), { ...rest, updatedAt: serverTimestamp() })
    setEditingCourse(null)
  }
  const deleteCourse = async () => {
    if (!deletingCourse) return
    await deleteDoc(doc(db, "courses", deletingCourse.id))
    setDeletingCourse(null)
  }

  // Handlers for student CRUD
  const createStudent = () => {
    setShowStudentCreation(true)
  }
  const updateStudent = (s: Student) => setEditingStudent(s)
  const deleteStudent = (s: Student) => setDeletingStudent(s)

  // Overview stats derived from live data
  const totalCourses = courses.length
  const totalStudents = students.length
  const activeStudents = students.filter((s) => s.status === "active").length
  const totalLogins = students.reduce((sum, s) => sum + (s.lastLogin ? 1 : 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bio-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Dna className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">BioLearn Admin</h1>
              <p className="text-green-100 text-sm">Welcome, {user?.fullName}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="bg-white/10 border-white/20 text-white"
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={(value: string) => {
            setSearchTerm("")
            setActiveTab(value as TabKey)
          }}
        >
          <TabsList className="grid grid-cols-4 bg-white shadow-sm mb-6">
            <TabsTrigger value="overview">
              <BarChart3 /> Overview
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen /> Courses
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users /> Students
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Leaf /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-primary">
                <CardHeader className="flex justify-between items-center pb-2">
                  <CardTitle className="text-sm">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">{activeStudents} active</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-emerald-500">
                <CardHeader className="flex justify-between items-center pb-2">
                  <CardTitle className="text-sm">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{totalCourses}</div>
                  <p className="text-xs text-muted-foreground">created</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-blue-500">
                <CardHeader className="flex justify-between items-center pb-2">
                  <CardTitle className="text-sm">Total Logins</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{totalLogins}</div>
                  <p className="text-xs text-muted-foreground">with login records</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-orange-500">
                <CardHeader className="flex justify-between items-center pb-2">
                  <CardTitle className="text-sm">Engagement</CardTitle>
                  <Microscope className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {totalStudents ? Math.floor((activeStudents / totalStudents) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">active rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Course Management</h2>
              <Button className="bio-gradient" onClick={() => setShowCourseCreation(true)}>
                <Plus className="mr-2" /> New Course
              </Button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <CourseManager
              courses={filteredCourses}
              onEdit={setEditingCourse}
              onDelete={setDeletingCourse}
            />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Student Management</h2>
              <Button className="bio-gradient" onClick={createStudent}>
                <UserPlus className="mr-2" /> Add Student
              </Button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <StudentManager onEdit={updateStudent} onDelete={deleteStudent} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <p className="text-muted-foreground">
              Coming soon: charts and reports based on Firestore data.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showCourseCreation && (
        <CourseCreationModal onClose={() => setShowCourseCreation(false)} onSave={createCourse} />
      )}
      {editingCourse && (
        <CourseEditModal
          course={{ ...editingCourse, videos: editingCourse.videos || [], documents: editingCourse.documents || [] }}
          onClose={() => setEditingCourse(null)}
          onSave={updateCourse}
        />
      )}
      {deletingCourse && (
        <DeleteConfirmModal
          type="course"
          item={deletingCourse}
          onClose={() => setDeletingCourse(null)}
          onConfirm={deleteCourse}
        />
      )}

      {showStudentCreation && (
        <StudentCreationModal onClose={() => setShowStudentCreation(false)} onSave={() => setShowStudentCreation(false)} />
      )}
      {editingStudent && <StudentEditModal student={editingStudent} onClose={() => setEditingStudent(null)} onSave={() => setEditingStudent(null)} />}
      {deletingStudent && (
        <DeleteConfirmModal
          type="student"
          item={deletingStudent}
          onClose={() => setDeletingStudent(null)}
          onConfirm={async () => {
            await deleteDoc(doc(db, "users", deletingStudent.id))
            setDeletingStudent(null)
          }}
        />
      )}
    </div>
  )
}
