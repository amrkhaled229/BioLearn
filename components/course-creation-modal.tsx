// components/course-creation-modal.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save, PlayCircle, FileText, Upload, ImageIcon } from "lucide-react"

interface CourseCreationModalProps {
  onClose: () => void
  onSave: (course: any) => void
}

export function CourseCreationModal({ onClose, onSave }: CourseCreationModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImage: "",
    videos: [] as { id: string; title: string; embedCode: string }[],
    documents: [] as { id: string; title: string; url: string; size: string }[],
    category: "general",
  })

  const [newVideo, setNewVideo] = useState({ title: "", embedCode: "" })
  const [newDocument, setNewDocument] = useState<{ title: string; file: File | null }>({
    title: "",
    file: null,
  })

  const handleSave = () => {
    if (!formData.title || !formData.description) {
      alert("Please fill in all required fields")
      return
    }
    const newCourse = {
      id: Date.now().toString(),
      ...formData,
      assignedStudents: [] as string[],
      createdAt: new Date().toISOString().split("T")[0],
    }
    onSave(newCourse)
  }

  const addVideo = () => {
    if (newVideo.title && newVideo.embedCode) {
      setFormData((prev) => ({
        ...prev,
        videos: [
          ...prev.videos,
          { id: Date.now().toString(), title: newVideo.title, embedCode: newVideo.embedCode },
        ],
      }))
      setNewVideo({ title: "", embedCode: "" })
    }
  }

  const addDocument = () => {
    const file = newDocument.file
    if (newDocument.title && file) {
      setFormData((prev) => ({
        ...prev,
        documents: [
          ...prev.documents,
          {
            id: Date.now().toString(),
            title: newDocument.title,
            url: `/docs/${file.name}`,
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          },
        ],
      }))
      setNewDocument({ title: "", file: null })
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Biology Course</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Advanced Cell Biology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="general">General Biology</option>
                  <option value="cell">Cell Biology</option>
                  <option value="genetics">Genetics</option>
                  <option value="ecology">Ecology</option>
                  <option value="molecular">Molecular Biology</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                placeholder="Describe what students will learn..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                }
                placeholder="https://example.com/course-cover.jpg"
              />
            </div>

            {formData.coverImage && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <img
                  src={formData.coverImage}
                  alt="Course cover preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <PlayCircle className="inline-block mr-2" /> Course Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Video Title</Label>
                  <Input
                    value={newVideo.title}
                    onChange={(e) =>
                      setNewVideo((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter video title"
                  />
                  <Label>Embed Code</Label>
                  <Textarea
                    rows={3}
                    value={newVideo.embedCode}
                    onChange={(e) =>
                      setNewVideo((prev) => ({ ...prev, embedCode: e.target.value }))
                    }
                    placeholder="<iframe src=…></iframe>"
                  />
                  <Button variant="outline" className="mt-2" onClick={addVideo}>
                    <Plus className="mr-2" /> Add Video
                  </Button>
                </div>

                {formData.videos.length > 0 && (
                  <div className="space-y-4 mt-4">
                    <p className="font-medium">Preview Videos ({formData.videos.length})</p>
                    {formData.videos.map((video) => (
                      <div key={video.id} className="border rounded p-4">
                        <h4 className="font-semibold mb-2">{video.title}</h4>
                        <div
                          className="prose max-w-full"
                          dangerouslySetInnerHTML={{ __html: video.embedCode }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <FileText className="inline-block mr-2" /> Course Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <Input
                    placeholder="Document title"
                    value={newDocument.title}
                    onChange={(e) =>
                      setNewDocument((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) =>
                      setNewDocument((prev) => ({ ...prev, file: e.target.files?.[0] || null }))
                    }
                  />
                </div>
                <Button variant="outline" onClick={addDocument}>
                  <Upload className="mr-2" /> Add Document
                </Button>

                {formData.documents.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="font-medium">Added Documents ({formData.documents.length})</p>
                    {formData.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="flex-1">{doc.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <ImageIcon className="inline-block mr-2" /> Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced settings coming soon (visibility, prerequisites, grading…)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bio-gradient" onClick={handleSave}>
            <Save className="mr-2" /> Create Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
