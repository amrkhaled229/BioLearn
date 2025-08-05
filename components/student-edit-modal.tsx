// components/student-edit-modal.tsx
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, BookOpen, Activity, Mail, Phone, Save } from "lucide-react"
import { collection, doc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Student {
  id: string
  username: string
  fullName: string
  phoneNumber?: string
  assignedCourses: string[]
  lastLogin?: string
  status?: "active" | "inactive" | string
  notifications?: Record<string, boolean>
}

interface StudentEditModalProps {
  student: Student
  onClose: () => void
  onSave?: () => void
}

export function StudentEditModal({ student, onClose, onSave }: StudentEditModalProps) {
  // Local form state initialized from passed student
  const [formData, setFormData] = useState({
    username: student.username,
    fullName: student.fullName,
    phoneNumber: student.phoneNumber || "",
    status: student.status || "active",
    assignedCourses: student.assignedCourses || [],
    notifications: student.notifications || {
      email: true,
      sms: false,
      courseUpdates: true,
      assignments: true,
    },
  })

  // List of all courses for assignment toggles
  const [coursesList, setCoursesList] = useState<{ id: string; title: string }[]>([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "courses"), (snapshot) => {
      setCoursesList(
        snapshot.docs.map((d) => ({
          id: d.id,
          title: (d.data() as any).title,
        }))
      )
    })
    return () => unsub()
  }, [])

  const toggleCourse = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedCourses: prev.assignedCourses.includes(courseId)
        ? prev.assignedCourses.filter((id) => id !== courseId)
        : [...prev.assignedCourses, courseId],
    }))
  }

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", student.id)
      await updateDoc(userRef, {
        username: formData.username,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        status: formData.status,
        assignedCourses: formData.assignedCourses,
        notifications: formData.notifications,
        updatedAt: serverTimestamp(),
      })
      onSave?.()
      onClose()
    } catch (err) {
      console.error("Error updating student:", err)
      alert("Failed to save changes. See console for details.")
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Edit Student: {student.fullName}
          </DialogTitle>
          <DialogDescription>
            Modify student details, course assignments, and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-white text-lg">
                  {formData.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{formData.fullName}</h3>
                <p className="text-muted-foreground">@{formData.username}</p>
                <Badge variant={formData.status === "active" ? "default" : "secondary"}>
                  {formData.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, username: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as any }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {coursesList.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <p className="font-medium">{c.title}</p>
                    <Switch
                      checked={formData.assignedCourses.includes(c.id)}
                      onCheckedChange={() => toggleCourse(c.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab (static for now) */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Learning Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">--%</div>
                    <p className="text-sm text-muted-foreground">Average Progress</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">--</div>
                    <p className="text-sm text-muted-foreground">Videos Watched</p>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <h4 className="font-medium">Recent Activity</h4>
                  <div className="flex justify-between text-sm">
                    <span>Last Login</span>
                    <span>{student.lastLogin || "—"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
