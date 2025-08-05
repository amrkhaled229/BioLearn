"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
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
import {
  ArrowLeft,
  PlayCircle,
  FileText,
  Download,
  Clock,
  CheckCircle,
  Users,
  Edit,
  AlertCircle,
} from "lucide-react"

type VideoMeta = {
  id: string
  title: string
  duration: string
}
type DocumentMeta = {
  id: string
  title: string
  size: string
  url: string
}
type CourseDoc = {
  title: string
  description: string
  coverImage?: string
  instructor?: string
  duration?: string
  level?: string
  assignedStudents?: number
  videos?: VideoMeta[]
  documents?: DocumentMeta[]
}

export default function CoursePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, logout } = useAuth()

  const [course, setCourse] = useState<CourseDoc | null>(null)
  const [videos, setVideos] = useState<VideoMeta[]>([])
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [activeTab, setActiveTab] = useState<"videos" | "documents">("videos")

  // playbackInfo store per video
  const [playback, setPlayback] = useState<Record<
    string,
    { otp: string; playbackInfo: string }
  >>({})
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // subscribe course doc
  useEffect(() => {
    if (!id) return
    const ref = doc(db, "courses", id)
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return
      const data = snap.data() as CourseDoc
      setCourse(data)
      setVideos(data.videos || [])
      setDocs(data.documents || [])
    })
    return unsub
  }, [id])

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading course…</p>
      </div>
    )
  }

  // compute progress
  const totalVideos = videos.length
  const watchedCount = playingId ? 1 : 0 // simplistic: we only track current play
  const videoProgress = totalVideos
    ? Math.round((watchedCount / totalVideos) * 100)
    : 0

  // fetch OTP & playbackInfo for a video
  async function loadPlayback(vId: string) {
    if (playback[vId]) {
      setPlayingId(vId)
      return
    }

    setLoading(prev => ({ ...prev, [vId]: true }))
    setErrors(prev => ({ ...prev, [vId]: '' }))

    try {
      console.log('Fetching OTP for video ID:', vId)
      const res = await fetch(`/api/vdo/otp/${vId}`)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Response Error:', res.status, errorText)
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const json = await res.json()
      console.log('API Response:', json)

      if (json.error) {
        throw new Error(json.error)
      }

      if (json.otp && json.playbackInfo) {
        setPlayback((p) => ({ ...p, [vId]: json }))
        setPlayingId(vId)
        console.log('Successfully loaded playback info for:', vId)
      } else {
        throw new Error('Invalid response: missing otp or playbackInfo')
      }
    } catch (error) {
      console.error("Failed to fetch VdoCipher OTP", error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setErrors(prev => ({ ...prev, [vId]: errorMessage }))
    } finally {
      setLoading(prev => ({ ...prev, [vId]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bio-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {course.title}
              </h1>
              {course.instructor && (
                <p className="text-green-100 text-sm">
                  Instructor: {course.instructor}
                </p>
              )}
            </div>
            {user?.role === "admin" && (
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Course
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {course.description}
                  </CardDescription>
                </div>
                {course.coverImage && (
                  <img
                    src={course.coverImage}
                    alt=""
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="flex gap-4 mt-4">
                {course.level && (
                  <Badge variant="secondary">{course.level}</Badge>
                )}
                {course.duration && (
                  <Badge variant="secondary">{course.duration}</Badge>
                )}
                <Badge variant="secondary">{totalVideos} videos</Badge>
                <Badge variant="secondary">{docs.length} docs</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="videos">
                <PlayCircle className="h-4 w-4 inline" /> Videos (
                {totalVideos})
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 inline" /> Documents (
                {docs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-4">
              {videos.map((v) => (
                <Card key={v.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <PlayCircle
                        className={`h-8 w-8 ${
                          playingId === v.id ? "text-green-500" : "text-primary"
                        }`}
                      />
                      <div>
                        <p className="font-semibold">{v.title}</p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline" /> {v.duration}
                          {playingId === v.id && " • Playing"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Video ID: {v.id}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => loadPlayback(v.id)}
                      className="bio-gradient"
                      disabled={loading[v.id]}
                    >
                      {loading[v.id] ? "Loading..." : playingId === v.id ? "Replay" : "Watch"}
                    </Button>
                  </CardContent>
                  
                  {/* Error display */}
                  {errors[v.id] && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                        <p className="text-sm text-red-700">Error: {errors[v.id]}</p>
                      </div>
                    </div>
                  )}

                  {/* Video player */}
                  {playingId === v.id && playback[v.id] && (
                    <div className="p-4">
                      <iframe
                        src={`https://player.vdocipher.com/v2/?otp=${playback[v.id].otp}&playbackInfo=${playback[v.id].playbackInfo}`}
                        style={{ border: 0, width: '100%', height: '405px' }}
                        allow="encrypted-media"
                        allowFullScreen
                        title={`Video: ${v.title}`}
                      />
                    </div>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              {docs.map((d) => (
                <Card key={d.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold">{d.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {d.size}
                        </p>
                      </div>
                    </div>
                    <a href={d.url} target="_blank" rel="noreferrer">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{videoProgress}%</span>
                </div>
                <Progress value={videoProgress} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Videos Watched</span>
                  <span>
                    {watchedCount}/{totalVideos}
                  </span>
                </div>
                <Progress value={videoProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.instructor && (
                <div className="flex justify-between">
                  <span>Instructor</span>
                  <span>{course.instructor}</span>
                </div>
              )}
              {course.duration && (
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>{course.duration}</span>
                </div>
              )}
              {course.level && (
                <div className="flex justify-between">
                  <span>Level</span>
                  <span>{course.level}</span>
                </div>
              )}
              {user?.role === "admin" && course.assignedStudents != null && (
                <div className="flex justify-between">
                  <span>Enrolled Students</span>
                  <span>{course.assignedStudents}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}