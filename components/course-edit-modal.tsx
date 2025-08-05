// components/course-edit-modal.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Video } from "./course-manager"

interface CourseEditModalProps {
  course: {
    id: string
    title: string
    description: string
    coverImage: string
    videos: Video[]
    documents: { id: string; title: string; url: string }[]
  }
  onClose: () => void
  onSave: (course: any) => void
}

export function CourseEditModal({ course, onClose, onSave }: CourseEditModalProps) {
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description)
  const [coverImage, setCoverImage] = useState(course.coverImage)
  const [videos, setVideos] = useState<Video[]>(course.videos ?? [])

  const handleUpdateVideo = (index: number, field: keyof Video, value: string) => {
    setVideos((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleAddVideo = () => {
    setVideos((prev) => [...prev, { id: crypto.randomUUID(), title: "", embedCode: "" }])
  }

  const handleRemoveVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave({
      ...course,
      title,
      description,
      coverImage,
      videos,
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Videos</Label>
              {videos.map((video, index) => (
                <div key={video.id} className="border p-2 rounded space-y-2">
                  <Input
                    placeholder="Video Title"
                    value={video.title}
                    onChange={(e) => handleUpdateVideo(index, "title", e.target.value)}
                  />
                  <Textarea
                    placeholder="Embed Code"
                    value={video.embedCode}
                    onChange={(e) => handleUpdateVideo(index, "embedCode", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveVideo(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" size="sm" onClick={handleAddVideo}>
                Add Video
              </Button>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}