"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Trash2, BookOpen, User } from "lucide-react"

interface DeleteConfirmModalProps {
  type: "course" | "student"
  item: any
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmModal({ type, item, onClose, onConfirm }: DeleteConfirmModalProps) {
  const getIcon = () => {
    return type === "course" ? <BookOpen className="h-5 w-5" /> : <User className="h-5 w-5" />
  }

  const getTitle = () => {
    return type === "course" ? item.title : item.fullName
  }

  const getWarningMessage = () => {
    if (type === "course") {
      return `This will permanently delete the course "${item.title}" and remove access for all ${item.assignedStudents || 0} assigned students. All course materials, videos, and documents will be lost.`
    } else {
      return `This will permanently delete the student account for "${item.fullName}" (@${item.username}). All their progress data and course access will be lost.`
    }
  }

  const getImpactDetails = () => {
    if (type === "course") {
      return [
        `${item.videoCount || 0} videos will be removed`,
        `${item.documentCount || 0} documents will be deleted`,
        `${item.assignedStudents || 0} students will lose access`,
        "All progress data will be lost",
      ]
    } else {
      return [
        `Access to ${item.assignedCourses || 0} courses will be revoked`,
        "All learning progress will be deleted",
        "Account cannot be recovered",
        "Student will need to be re-created manually",
      ]
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete {type === "course" ? "Course" : "Student"}
          </DialogTitle>
          <DialogDescription>This action cannot be undone. Please confirm you want to proceed.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            {getIcon()}
            <div>
              <p className="font-medium">{getTitle()}</p>
              <p className="text-sm text-muted-foreground">
                {type === "course" ? "Biology Course" : `@${item.username}`}
              </p>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{getWarningMessage()}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm font-medium">This will result in:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {getImpactDetails().map((detail, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-destructive rounded-full" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {type === "course" ? "Course" : "Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
