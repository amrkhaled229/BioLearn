// components/student-creation-modal.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { UserPlus, Save, BookOpen, Settings, Eye, EyeOff } from "lucide-react"
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface StudentCreationModalProps {
  onClose: () => void
  onSave?: () => void
}

export function StudentCreationModal({ onClose, onSave }: StudentCreationModalProps) {
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    status: "active" as "active" | "inactive",
    assignedCourses: [] as string[],
    notifications: {
      email: true,
      sms: false,
      courseUpdates: true,
      assignments: true,
    },
  })

  // Password visibility & generation
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")

  // List of courses for assignment
  const [coursesList, setCoursesList] = useState<{ id: string; title: string }[]>([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "courses"), (snapshot) => {
      setCoursesList(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          title: (doc.data() as any).title,
        }))
      )
    })
    return () => unsub()
  }, [])

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let pwd = ""
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(pwd)
    setFormData((prev) => ({ ...prev, password: pwd }))
  }

  const toggleCourseAssignment = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedCourses: prev.assignedCourses.includes(courseId)
        ? prev.assignedCourses.filter((id) => id !== courseId)
        : [...prev.assignedCourses, courseId],
    }))
  }

  const handleSave = async () => {
    const { username, password, fullName } = formData
    if (!username || !password || !fullName) {
      alert("Please fill in all required fields")
      return
    }
    try {
      await addDoc(collection(db, "users"), {
        username: formData.username,
        // Note: In a real app, you'd also create a Firebase Auth user here
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        role: "student",
        status: formData.status,
        assignedCourses: formData.assignedCourses,
        notifications: formData.notifications,
        createdAt: serverTimestamp(),
      })
      onSave?.()
      onClose()
    } catch (err) {
      console.error("Failed to create student:", err)
      alert("Error creating student. Check console for details.")
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Create New Student Account
          </DialogTitle>
          <DialogDescription>
            Set up a new student account with course assignments and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Student Details</TabsTrigger>
            <TabsTrigger value="courses">Course Assignment</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="Enter student's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="student_username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as "active" | "inactive",
                    }))
                  }
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Password Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, password: e.target.value }))
                        }
                        placeholder="Enter password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="outline" onClick={generatePassword}>
                      Generate
                    </Button>
                  </div>
                </div>
                {generatedPassword && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Generated Password:</p>
                    <p className="text-sm font-mono">{generatedPassword}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Make sure to share this securely with the student
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Assign Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select which courses this student should have access to
                </p>
                {coursesList.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{course.title}</p>
                    </div>
                    <Switch
                      checked={formData.assignedCourses.includes(course.id)}
                      onCheckedChange={() => toggleCourseAssignment(course.id)}
                    />
                  </div>
                ))}
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Selected: {formData.assignedCourses.length} course(s)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(formData.notifications).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <Switch
                      checked={val}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, [key]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bio-gradient">
            <Save className="h-4 w-4 mr-2" />
            Create Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
