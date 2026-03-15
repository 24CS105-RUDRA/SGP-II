'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/StudentSidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Folder, ChevronRight, Eye } from 'lucide-react'
import { getStudyMaterialsByStudent } from '@/lib/actions/study-materials'
import { getStudentRecordByUserId } from '@/lib/actions/attendance'
import { getFoldersAndMaterialsByStandard } from '@/lib/actions/study-material-folders'

interface User {
  id: string
  username: string
  full_name: string
}

interface StudentRecord {
  id: string
  standard: string
  division: string
}

interface Material {
  id: string
  title: string
  description: string
  subject: string
  standard: string
  file_type: string
  file_url: string
  uploaded_date: string
  is_downloadable: boolean
  folder_id?: string
}

interface FolderWithChildren {
  id: string
  folder_name: string
  parent_folder_id?: string
  standard: string
  subject: string
  created_at: string
  children?: FolderWithChildren[]
  materials?: Material[]
}

export default function StudyMaterialsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [student, setStudent] = useState<StudentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<Material[]>([])
  const [folders, setFolders] = useState<FolderWithChildren[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const session = localStorage.getItem('userSession')
      const role = localStorage.getItem('userRole')

      if (!session || role !== 'student') {
        router.push('/login')
        return
      }

      const userData = JSON.parse(session) as User
      setUser(userData)

      const fetchStudentData = async () => {
        try {
          const result = await getStudentRecordByUserId(userData.id)

          if (result.success && result.data) {
            setStudent(result.data)

            // Fetch folders and materials for this student's standard
            const foldersResult = await getFoldersAndMaterialsByStandard(result.data.standard)
            if (foldersResult.success && foldersResult.data) {
              setFolders(foldersResult.data.folders || [])
              setMaterials(foldersResult.data.materials || [])
              // Expand first folder by default
              if ((foldersResult.data.folders || []).length > 0) {
                setExpandedFolders(new Set([(foldersResult.data.folders as FolderWithChildren[])[0].id]))
              }
            } else if (!foldersResult.success) {
              setError('Failed to fetch materials')
            }
          } else {
            setError('Failed to fetch student record')
          }
        } catch (err) {
          console.error('[v0] Error fetching data:', err)
          setError('An error occurred while fetching data')
        } finally {
          setLoading(false)
        }
      }

      fetchStudentData()
    } catch (err) {
      console.error('[v0] Setup error:', err)
      setError('An error occurred during setup')
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <StudentSidebar activeSection="study-materials" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading materials...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <StudentSidebar activeSection="study-materials" />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (!user) return null

  const handleDownload = (material: Material) => {
    try {
      if (!material.file_url) {
        alert('File URL not available')
        return
      }

      const link = document.createElement('a')
      link.href = material.file_url
      link.download = material.title || 'download'
      link.setAttribute('target', '_blank')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('[v0] Download error:', err)
      alert('Failed to download file')
    }
  }

  const handleViewFile = (material: Material) => {
    try {
      if (!material.file_url) {
        alert('File URL not available')
        return
      }

      window.open(material.file_url, '_blank', 'noreferrer')
    } catch (err) {
      console.error('[v0] View error:', err)
      alert('Failed to open file')
    }
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFolderTree = (folderList: FolderWithChildren[], level = 0) => {
    return folderList.map((folder) => (
      <div key={folder.id} style={{ marginLeft: `${level * 20}px` }} className="space-y-2">
        <button
          onClick={() => toggleFolder(folder.id)}
          className="w-full flex items-center gap-2 p-3 hover:bg-blue-100 dark:hover:bg-blue-950/30 rounded-lg"
        >
          <ChevronRight
            className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform ${
              expandedFolders.has(folder.id) ? 'rotate-90' : ''
            }`}
          />
          <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-foreground">{folder.folder_name}</span>
          <span className="text-xs text-muted-foreground ml-auto">({(folder.children?.length || 0) + (folder.materials?.length || 0)} items)</span>
        </button>

        {expandedFolders.has(folder.id) && (
          <div className="space-y-2 pl-4">
            {folder.materials?.map((material) => renderMaterial(material))}
            {folder.children && renderFolderTree(folder.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  const renderMaterial = (material: Material) => (
    <Card key={material.id} className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 flex gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground text-base leading-snug">{material.title}</h4>
              {material.description && (
                <p className="text-sm text-muted-foreground mt-2">{material.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {material.is_downloadable ? (
              <button 
                onClick={() => handleDownload(material)}
                className="flex-shrink-0 p-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground transition-colors"
                title="Download file"
              >
                <Download className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => handleViewFile(material)}
                className="flex-shrink-0 p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                title="View file"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs bg-background">
            {material.file_type}
          </Badge>
          <Badge variant="outline" className="text-xs bg-background">
            Class {material.standard}
          </Badge>
          <Badge className={material.is_downloadable ? 'bg-green-600 text-white text-xs' : 'bg-amber-600 text-white text-xs'}>
            {material.is_downloadable ? 'Downloadable' : 'View Only'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="study-materials" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Study Materials</h1>
          <p className="text-muted-foreground mb-8">({folders.length} folders, {materials.length} root materials)</p>

          {folders.length === 0 && materials.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No study materials available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Render Folders */}
              {renderFolderTree(folders)}

              {/* Render Root Materials */}
              {materials.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground mb-2">Other Materials</h3>
                  {materials.map((material) => renderMaterial(material))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
