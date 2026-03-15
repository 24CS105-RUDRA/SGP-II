# Gallery Management Module - Complete Documentation

## Overview
The Gallery Management Module is a comprehensive system for managing school event photography with role-based access control and real-time synchronization between admin/faculty upload panels and the student-facing gallery.

## Architecture

### Database Schema
Two main tables power the gallery system:

#### `gallery_events` Table
- `id`: UUID (primary key)
- `event_name`: String - Name of the event
- `cover_image_url`: String - URL of cover thumbnail image
- `description`: Text - Event description
- `event_date`: Date - When the event occurred
- `created_by`: String - Username of creator
- `created_by_role`: Enum - 'admin' or 'faculty'
- `is_published`: Boolean - Controls visibility to students
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### `gallery_images` Table
- `id`: UUID (primary key)
- `event_id`: UUID (foreign key to gallery_events)
- `image_url`: String - URL of the image
- `image_name`: String - Original filename
- `uploaded_at`: Timestamp

### Row Level Security (RLS)
- Events are viewable by students only if `is_published = true`
- Admin/Faculty can only modify their own events
- Students can only view published events

## Features

### Admin Panel (`/app/admin/gallery/page.tsx`)

**Key Features:**
- Create new gallery events with mandatory Event Name and Cover Thumbnail
- View all events (published and draft) in a grid layout
- Search events by name
- Bulk upload multiple images to any event
- Publish/unpublish events for student visibility
- Delete individual images or entire events
- Real-time status indicators (Published/Draft badges)

**Workflow:**
1. Admin clicks "Create Event" button
2. Fills in event details including cover image
3. Event is created in draft mode
4. Admin clicks on event card to view details
5. Admin uploads multiple images using drag-and-drop or file browser
6. Admin publishes event, making it visible to all students
7. Changes sync immediately to student gallery

### Faculty Panel (`/app/faculty/gallery/page.tsx`)

**Key Features:**
- Same interface as admin but limited to faculty's own events
- Create and manage event galleries
- Upload images in bulk
- Publish events for students
- Delete own events and images

**Workflow:**
- Faculty follows the same process as admin but can only see/manage their own created events
- Events created by faculty are isolated to their account

### Student Gallery (`/app/student/gallery/page.tsx`)

**Key Features:**
- Grid-based view of all published events
- Event thumbnails with descriptions and dates
- Click to view full event details
- High-resolution image lightbox viewer
- Keyboard and thumbnail navigation
- Image counter showing current position
- Responsive design for all devices

**Interactions:**
1. Student sees grid of event thumbnails (only published events)
2. Click any thumbnail to enter event view
3. See all photos from that event in grid format
4. Click any photo to open interactive lightbox
5. Navigate with arrow buttons or keyboard arrows
6. Use thumbnail strip for quick jumping
7. Click ESC or X button to close lightbox

## Server Actions (`/lib/actions/gallery-events.ts`)

### Core Functions:

#### `createGalleryEvent(data)`
Creates a new gallery event. Only requires event name and cover image.
```typescript
await createGalleryEvent({
  event_name: 'Sports Day 2024',
  cover_image_url: 'https://blob.url...',
  description: 'Optional description',
  event_date: '2024-02-20',
  created_by: 'admin_username',
  created_by_role: 'admin'
})
```

#### `uploadGalleryImages(eventId, images)`
Bulk upload multiple images to an event.
```typescript
await uploadGalleryImages(eventId, [
  { url: 'https://blob.url...', name: 'photo1.jpg' },
  { url: 'https://blob.url...', name: 'photo2.jpg' }
])
```

#### `publishGalleryEvent(eventId)`
Makes an event visible to all students.
```typescript
await publishGalleryEvent(eventId)
```

#### `getPublishedGalleryEvents()`
Fetches all events that students can see (published only).

#### `getGalleryEventWithImages(eventId)`
Fetches a specific event with all its images.

#### `deleteGalleryEvent(eventId)`
Deletes event and all associated images.

#### `deleteGalleryImage(imageId)`
Deletes a single image from an event.

## API Routes

### POST `/api/upload-gallery-image`
Uploads image to Vercel Blob storage.

**Request:**
```
Content-Type: multipart/form-data
Body: { file: File }
```

**Response:**
```json
{ "url": "https://blob.url..." }
```

**Features:**
- Automatic file naming with timestamp
- Public access for student viewing
- Supports all common image formats

## Image Upload Flow

1. Admin/Faculty selects image files from their computer
2. Frontend sends multipart form data to `/api/upload-gallery-image`
3. API routes files to Vercel Blob
4. API returns public URL
5. Frontend creates database record with image URL
6. Images immediately visible in the event detail view

## Real-Time Sync Mechanism

**Publishing Cascade:**
1. Admin/Faculty clicks "Publish" on an event
2. `is_published` flag set to true in database
3. **All students see the event immediately** due to:
   - Students fetch published events on page load
   - Next.js ISR can be configured for cache invalidation
   - No page refresh needed for students viewing gallery

**Database Queries:**
- Student queries: `WHERE is_published = true`
- Admin/Faculty queries: `WHERE created_by = current_user`
- RLS policies enforce data isolation

## Security Features

1. **Role-Based Access:**
   - Admins manage all events
   - Faculty manage only own events
   - Students view only published events

2. **Database RLS Policies:**
   - Enforce who can create/read/update/delete
   - Prevent students from accessing draft events
   - Prevent cross-user unauthorized access

3. **Input Validation:**
   - Event name required
   - Cover image required
   - File type validation for images

4. **File Security:**
   - Files stored in Vercel Blob with public URLs
   - Timestamps prevent filename conflicts
   - No sensitive data in URLs

## Styling & UI

- **Admin/Faculty:**
  - Card-based event browser
  - Search functionality
  - Hover effects and transitions
  - Badge status indicators
  - Modal-like event detail view

- **Student:**
  - Clean grid layout
  - Smooth lightbox with transitions
  - Responsive design (1 col mobile, 3 col desktop)
  - Thumbnail navigation strip
  - Keyboard arrow navigation support

## Component Dependencies

- shadcn/ui: Button, Card, Input, Label, Textarea, Badge
- lucide-react: Icons (Plus, Upload, Trash2, Eye, Search, etc.)
- Next.js Image: Optimized image rendering
- Vercel Blob: Image storage

## Error Handling

All operations include:
- Try-catch blocks for network errors
- User-facing alert messages
- Console logging for debugging
- Graceful fallbacks

## Browser Compatibility

- Modern browsers with ES6 support
- Mobile-friendly touch interactions
- Keyboard navigation support
- CSS Grid and Flexbox layouts

## Performance Optimizations

- Image lazy loading with Next.js Image component
- Pagination ready (though current page shows all events)
- Thumbnail generation via cover images
- Client-side image preview before upload

## Future Enhancement Ideas

- Image compression before upload
- Event categories/tags for filtering
- Comment/rating system for students
- Download image functionality
- Social sharing (Facebook, WhatsApp)
- Image optimization and CDN caching
- Batch event creation
- Event analytics (views, downloads)
