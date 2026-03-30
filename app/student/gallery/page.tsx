'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentSidebar } from '@/components/layout/student-sidebar'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import {
  getPublishedGalleryEvents,
  getGalleryEventWithImages,
  GalleryEvent,
  GalleryImage,
} from '@/lib/actions/gallery-events'

export default function StudentGalleryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<GalleryEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<GalleryEvent | null>(null)
  const [eventImages, setEventImages] = useState<GalleryImage[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'student') {
      router.push('/login')
      return
    }

    const userData = JSON.parse(session)
    setUser(userData)
    fetchPublishedEvents()
    setLoading(false)
  }, [router])

  const fetchPublishedEvents = async () => {
    const result = await getPublishedGalleryEvents()
    if (result.success && result.data) {
      setEvents(result.data)
    }
  }

  const handleEventClick = async (event: GalleryEvent) => {
    setSelectedEvent(event)
    const result = await getGalleryEventWithImages(event.id)
    if (result.success && result.images) {
      setEventImages(result.images)
    }
  }

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? eventImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === eventImages.length - 1 ? 0 : prev + 1))
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="gallery" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 pl-16 md:p-8">
          {!selectedEvent ? (
            <>
              <h1 className="text-3xl font-bold text-primary mb-8">School Gallery</h1>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.length > 0 ? (
                  events.map((event) => (
                    <Card
                      key={event.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow hover:scale-105 transform"
                      onClick={() => handleEventClick(event)}
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
                        {event.event_date && (
                          <p className="text-sm text-muted-foreground mb-2">{event.event_date}</p>
                        )}
                        {event.description && (
                          <p className="text-sm text-foreground/70 line-clamp-2">{event.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No gallery events yet. Check back soon!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Event Detail View */}
              <div className="mb-6">
                <Button
                  onClick={() => {
                    setSelectedEvent(null)
                    setEventImages([])
                    setLightboxOpen(false)
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Gallery
                </Button>
              </div>

              <Card className="mb-8 border-2 border-primary">
                <CardHeader>
                  <CardTitle>{selectedEvent.event_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedEvent.description && (
                    <p className="text-foreground/80 mb-4">{selectedEvent.description}</p>
                  )}
                  {selectedEvent.event_date && (
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(selectedEvent.event_date).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Images Grid */}
              <div>
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Event Photos ({eventImages.length})
                </h2>
                {eventImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {eventImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative group cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => image.image_url && image.image_url !== '' && openLightbox(index)}
                      >
                        {image.image_url && image.image_url !== '' ? (
                          <>
                            <div className="relative w-full h-40">
                              <Image
                                src={image.image_url}
                                alt={image.image_name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white font-semibold">Click to view</p>
                            </div>
                          </>
                        ) : (
                          <div className="relative w-full h-40 bg-gray-200 rounded flex items-center justify-center">
                            <p className="text-xs text-gray-500">Image unavailable</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No photos in this event</p>
                )}
              </div>

              {/* Lightbox */}
              {lightboxOpen && eventImages.length > 0 && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                  <div className="relative w-full max-w-4xl">
                    {/* Close Button */}
                    <button
                      onClick={closeLightbox}
                      className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                    >
                      <X className="w-8 h-8" />
                    </button>

                    {/* Main Image */}
                    <div className="relative w-full h-96 md:h-[600px]">
                      {eventImages[currentImageIndex]?.image_url ? (
                        <Image
                          src={eventImages[currentImageIndex].image_url}
                          alt={eventImages[currentImageIndex].image_name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <p className="text-white">Image unavailable</p>
                        </div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="absolute inset-y-0 left-0 flex items-center -ml-16">
                      <button
                        onClick={goToPrevious}
                        className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="absolute inset-y-0 right-0 flex items-center -mr-16">
                      <button
                        onClick={goToNext}
                        className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Image Counter */}
                    <div className="text-center text-white mt-4">
                      <p className="text-sm">
                        {currentImageIndex + 1} / {eventImages.length}
                      </p>
                    </div>

                    {/* Thumbnail Navigation */}
                    <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
                      {eventImages.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-16 h-16 rounded border-2 transition-colors ${
                            index === currentImageIndex
                              ? 'border-white'
                              : 'border-white/30 hover:border-white/60'
                          }`}
                        >
                          {image.image_url ? (
                            <Image
                              src={image.image_url}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded">
                              <p className="text-xs text-gray-400">N/A</p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
