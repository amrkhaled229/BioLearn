// components/student-manager.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Trash2, Mail, Phone, BookOpen } from "lucide-react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Student {
  id: string
  username: string
  fullName: string
  phoneNumber?: string
  assignedCourses: string[]
  lastLogin?: string
  status?: "active" | "inactive" | string
}

interface StudentManagerProps {
  onEdit?: (student: Student) => void
  onDelete?: (student: Student) => void
}

export function StudentManager({ onEdit, onDelete }: StudentManagerProps) {
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    // Listen to all users, filter to students
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => {
          const dt = doc.data() as any
          if (dt.role !== "student") return null
          return {
            id: doc.id,
            username: dt.username || "",
            fullName: dt.fullName || "",
            phoneNumber: dt.phoneNumber,
            assignedCourses: dt.assignedCourses || [],
            lastLogin: dt.lastLogin || "",
            status: dt.status || "active",
          } as Student
        })
        .filter((s) => s !== null) as Student[]

      setStudents(data)
    })

    return () => unsub()
  }, [])

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <Card key={student.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-white">
                    {student.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{student.fullName}</h3>
                    <Badge
                      variant={
                        student.status === "active" ? "default" : "secondary"
                      }
                    >
                      {student.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{student.username}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {student.phoneNumber}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {student.assignedCourses.length} courses
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Notify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(student)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive bg-transparent"
                  onClick={() => onDelete?.(student)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {students.length === 0 && (
        <p className="text-center text-muted-foreground">
          No students found.
        </p>
      )}
    </div>
  )
}
