// components/course-manager.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Users, PlayCircle, FileText } from "lucide-react"

export type Video = {
  id: string
  title: string
  embedCode: string
}

export type Course = {
  id: string
  title: string
  description: string
  coverImage: string
  videos?: Video[]
  documents?: { id: string; title: string; url: string }[]
  assignedStudents: number
  createdAt: string
}

interface CourseManagerProps {
  courses: Course[]
  onEdit?: (course: Course) => void
  onDelete?: (course: Course) => void
}

export function CourseManager({ courses, onEdit, onDelete }: CourseManagerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video relative">
            <img
              src={course.coverImage || "/placeholder.svg"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/50 text-white">
                {course.assignedStudents} students
              </Badge>
            </div>
          </div>

          <CardHeader>
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <PlayCircle className="h-4 w-4" />
                {(course.videos?.length ?? 0)} videos
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {(course.documents?.length ?? 0)} docs
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.assignedStudents} assigned
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => onEdit?.(course)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive bg-transparent"
                onClick={() => onDelete?.(course)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {courses.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">No courses found matching your search.</p>
        </div>
      )}
    </div>
  )
}
