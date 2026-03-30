'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FacultySidebar } from '@/components/layout/faculty-sidebar'
import { Plus, Trash2, Upload, Eye, Search } from 'lucide-react'
import Image from 'next/image'
import {
  createGalleryEvent,
  getAllGalleryEvents,
  uploadGalleryImages,
  publishGalleryEvent,
  deleteGalleryEvent,
  deleteGalleryImage,
  getGalleryEventWithImages,
  GalleryEvent,
  GalleryImage,
} from '@/lib/actions/gallery-events'

export default function FacultyGalleryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<GalleryEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<GalleryEvent | null>(null)
  const [eventImages, setEventImages] = useState<GalleryImage[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  const [eventForm, setEventForm] = useState({
    event_name: '',
    description: '',
    event_date: '',
    cover_image: null as File | null,
    cover_image_preview: '',
  })

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'faculty') {
      router.push('/login')
      return
    }

    const userData = JSON.parse(session)
    setUser(userData)
    console.log('[v0] Faculty user loaded:', userData.username)
    fetchEvents(userData.username)
    setLoading(false)
  }, [router])

  const fetchEvents = async (username?: string) => {
    const result = await getAllGalleryEvents()
    console.log('[v0] All events fetched:', result.data?.length || 0)
    if (result.success && result.data) {
      // Faculty only sees their own events
      const facultyEvents = result.data.filter(
        (event) => event.created_by === (username || user?.username) && event.created_by_role === 'faculty'
      )
      console.log('[v0] Filtered faculty events:', facultyEvents.length)
      setEvents(facultyEvents)
    }
  }

  const fetchEventImages = async (eventId: string) => {
    console.log('[v0] Fetching images for event:', eventId)
    const result = await getGalleryEventWithImages(eventId)
    console.log('[v0] Fetch result:', result)
    console.log('[v0] Result success:', result.success)
    console.log('[v0] Result images:', result.images)
    if (result.success && result.images) {
      console.log('[v0] Setting images count:', result.images.length)
      setEventImages(result.images)
    } else {
      console.log('[v0] No images returned or error:', result.error)
    }
  }

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEventForm({ ...eventForm, cover_image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setEventForm((prev) => ({
          ...prev,
          cover_image_preview: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eventForm.event_name || !eventForm.cover_image) {
      alert('Please fill in Event Name and select a Cover Image')
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', eventForm.cover_image)

      const uploadRes = await fetch('/api/upload-gallery-image', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({ error: 'Failed to upload cover image' }))
        throw new Error(errorData.error || 'Failed to upload cover image')
      }

      const { url: coverImageUrl } = await uploadRes.json()

      const result = await createGalleryEvent({
        event_name: eventForm.event_name,
        description: eventForm.description,
        event_date: eventForm.event_date,
        cover_image_url: coverImageUrl,
        created_by: user.username,
        created_by_role: 'faculty',
      })

      if (result.success) {
        alert('Event created successfully!')
        setEventForm({
          event_name: '',
          description: '',
          event_date: '',
          cover_image: null,
          cover_image_preview: '',
        })
        setShowEventForm(false)
        await fetchEvents()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('[v0] Event creation error:', error)
      alert('Failed to create event: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || !selectedEvent) {
      alert('Please select event and images')
      return
    }

    try {
      setUploading(true)
      console.log('[v0] Starting image upload for event:', selectedEvent.id, 'Files count:', files.length)
      const uploadedImages = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log(`[v0] Uploading file ${i + 1}:`, file.name, 'Size:', file.size)
        
        const formData = new FormData()
        formData.append('file', file)

        const uploadRes = await fetch('/api/upload-gallery-image', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text()
          console.error(`[v0] Upload failed for ${file.name}:`, uploadRes.status, uploadRes.statusText, 'Response:', errorText)
          try {
            const errorJson = JSON.parse(errorText)
            console.error('[v0] Error details:', errorJson)
          } catch (e) {
            console.error('[v0] Could not parse error response')
          }
          continue
        }

        const uploadData = await uploadRes.json()
        const url = uploadData.url
        console.log(`[v0] File uploaded successfully: ${file.name} -> ${url}`)
        uploadedImages.push({ url, name: file.name })
      }

      console.log('[v0] Total uploaded images:', uploadedImages.length)

      if (uploadedImages.length > 0) {
        console.log('[v0] Saving to database:', uploadedImages)
        const result = await uploadGalleryImages(selectedEvent.id, uploadedImages)

        if (result.success) {
          console.log('[v0] Images saved to database successfully')
          alert(`${uploadedImages.length} images uploaded successfully!`)
          await fetchEventImages(selectedEvent.id)
        } else {
          console.error('[v0] Database save error:', result.error)
          alert('Error uploading images: ' + result.error)
        }
      } else {
        alert('No images were successfully uploaded')
      }
    } catch (error) {
      console.error('[v0] Image upload error:', error)
      alert('Failed to upload images: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handlePublishEvent = async (eventId: string) => {
    try {
      const result = await publishGalleryEvent(eventId)
      if (result.success) {
        alert('Event published successfully! Students can now see it.')
        await fetchEvents()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('[v0] Publish error:', error)
      alert('Failed to publish event')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event and all images?')) return

    try {
      const result = await deleteGalleryEvent(eventId)
      if (result.success) {
        alert('Event deleted successfully!')
        setSelectedEvent(null)
        setEventImages([])
        await fetchEvents()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('[v0] Delete error:', error)
      alert('Failed to delete event')
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Delete this image?')) return

    try {
      const result = await deleteGalleryImage(imageId)
      if (result.success) {
        setEventImages(eventImages.filter((img) => img.id !== imageId))
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('[v0] Image delete error:', error)
      alert('Failed to delete image')
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  const filteredEvents = events.filter((event) =>
    event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar activeSection="gallery" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-primary ml-5 md:ml-0">Gallery Management</h1>
            <Button
              onClick={() => setShowEventForm(!showEventForm)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </div>

          {/* Create Event Form */}
          {showEventForm && (
            <Card className="mb-8 border-2 border-accent">
              <CardHeader>
                <CardTitle>Create New Gallery Event</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <Label>Event Name *</Label>
                    <Input
                      value={eventForm.event_name}
                      onChange={(e) => setEventForm({ ...eventForm, event_name: e.target.value })}
                      placeholder="e.g., Class Picnic 2024"
                      required
                    />
                  </div>

                  <div>
                    <Label>Cover Thumbnail Image *</Label>
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      {eventForm.cover_image_preview && eventForm.cover_image_preview !== '' ? (
                        <div className="relative w-full h-40">
                          <Image
                            src={eventForm.cover_image_preview}
                            alt="Cover preview"
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to select cover image</p>
                        </div>
                      )}
                    </button>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageSelect}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <Label>Event Date</Label>
                    <Input
                      type="date"
                      value={eventForm.event_date}
                      onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Event details..."
                      className="min-h-24"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={uploading} className="bg-accent hover:bg-accent/90">
                      {uploading ? 'Creating...' : 'Create Event'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEventForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedEvent(event)
                  fetchEventImages(event.id)
                  setShowImageUpload(false)
                }}
              >
                <div className="relative w-full h-48">
                  <Image
                    src={event.cover_image_url}
                    alt={event.event_name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">{event.event_name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={event.is_published ? 'default' : 'secondary'}>
                      {event.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  {event.event_date && (
                    <p className="text-sm text-muted-foreground mb-3">{event.event_date}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Event Details */}
          {selectedEvent && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedEvent.event_name}</CardTitle>
                  <div className="flex gap-2">
                    {!selectedEvent.is_published && (
                      <Button
                        onClick={() => handlePublishEvent(selectedEvent.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Images */}
                <div>
                  <Button
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className="bg-accent hover:bg-accent/90 flex items-center gap-2 w-full md:w-auto"
                  >
                    <Upload className="w-4 h-4" />
                    {showImageUpload ? 'Hide Upload' : 'Add Images'}
                  </Button>

                  {showImageUpload && (
                    <div className="mt-4 border-2 border-dashed border-border rounded-lg p-6">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUploadImages}
                        disabled={uploading}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full text-center py-8 hover:bg-muted transition-colors rounded"
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {uploading ? 'Uploading...' : 'Click to select multiple images'}
                        </p>
                      </button>
                    </div>
                  )}
                </div>

                {/* Images Grid */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Images ({eventImages.length})</h3>
                  {eventImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {eventImages.map((image) => (
                        <div key={image.id} className="relative group">
                          {image.image_url && image.image_url !== '' ? (
                            <div className="relative w-full h-32">
                              <Image
                                src={image.image_url}
                                alt={image.image_name}
                                fill
                                className="object-cover rounded"
                                onError={(e) => {
                                  console.log('[v0] Image failed to load:', image.image_url)
                                }}
                              />
                            </div>
                          ) : (
                            <div className="relative w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                              <p className="text-xs text-gray-500 text-center p-2">Image URL missing</p>
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No images uploaded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
