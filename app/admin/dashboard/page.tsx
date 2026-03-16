'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Card, CardContent } from '@/components/ui/card'
import {
  GraduationCap,
  Users,
  Bell,
  DollarSign,
  ImageIcon,
  Lock,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { getAllStudents } from '@/lib/actions/students'
import { getAllGalleryEvents } from '@/lib/actions/gallery-events'

interface UserSession {
  username: string
  name: string
  role: string
}

interface Category {
  title: string
  icon: React.ReactNode
  link: string
  color: string
  bgColor: string
  description: string
}

interface DashboardStats {
  totalStudents: number
  totalFaculty: number
  totalClasses: number
  totalGalleryEvents: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    totalClasses: 0,
    totalGalleryEvents: 0,
  })

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'admin') {
      router.push('/login')
      return
    }

    const userData = JSON.parse(session)
    setUser(userData)
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      console.log('[v0] Fetching dashboard data')
      
      // Fetch all students
      const studentsResult = await getAllStudents()
      const studentCount = studentsResult.success ? (studentsResult.data?.length || 0) : 0
      console.log('[v0] Total students:', studentCount)

      // Fetch all gallery events
      const eventsResult = await getAllGalleryEvents()
      const eventCount = eventsResult.success ? (eventsResult.data?.length || 0) : 0
      console.log('[v0] Total gallery events:', eventCount)

      // Calculate unique classes
      let uniqueClasses = new Set<string>()
      if (studentsResult.success && studentsResult.data) {
        studentsResult.data.forEach((student: any) => {
          if (student.standard && student.division) {
            uniqueClasses.add(`${student.standard}-${student.division}`)
          }
        })
      }
      console.log('[v0] Total unique classes:', uniqueClasses.size)

      setStats({
        totalStudents: studentCount,
        totalFaculty: 45, // Could be fetched from faculty table if available
        totalClasses: uniqueClasses.size || 15,
        totalGalleryEvents: eventCount,
      })

      setLoading(false)
    } catch (error) {
      console.error('[v0] Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) return null

  const categories: Category[] = [
    {
      title: 'Student Profiles',
      icon: <GraduationCap className="w-12 h-12" />,
      link: '/admin/student-profiles',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      description: 'View and manage student profiles'
    },
    {
      title: 'Faculty Profiles',
      icon: <Users className="w-12 h-12" />,
      link: '/admin/faculty-profiles',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      description: 'View and manage faculty profiles'
    },
    {
      title: 'General Notices',
      icon: <Bell className="w-12 h-12" />,
      link: '/admin/notices',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      description: 'Post and manage notices'
    },
    {
      title: 'Fees Management',
      icon: <DollarSign className="w-12 h-12" />,
      link: '/admin/fees',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
      description: 'Manage fees details and payments'
    },
    {
      title: 'Gallery Management',
      icon: <ImageIcon className="w-12 h-12" />,
      link: '/admin/gallery',
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
      description: 'Upload and manage gallery images'
    },
    {
      title: 'Password Management',
      icon: <Lock className="w-12 h-12" />,
      link: '/admin/password-management',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      description: 'Manage student and faculty passwords'
    },
    {
      title: 'Analytics',
      icon: <BarChart3 className="w-12 h-12" />,
      link: '/admin/analytics',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      description: 'View school analytics'
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeSection="dashboard" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 md:ml-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome, {user.name}!</h1>
            <p className="text-muted-foreground">
              Administrator Panel - Manage school operations
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-2 border-blue-500/20 bg-blue-50 dark:bg-blue-950/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground mt-2">Total Students</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-500/20 bg-purple-50 dark:bg-purple-950/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalFaculty}</p>
                <p className="text-xs text-muted-foreground mt-2">Faculty Members</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-500/20 bg-green-50 dark:bg-green-950/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalClasses}</p>
                <p className="text-xs text-muted-foreground mt-2">Classes</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-cyan-500/20 bg-cyan-50 dark:bg-cyan-950/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{stats.totalGalleryEvents}</p>
                <p className="text-xs text-muted-foreground mt-2">Gallery Events</p>
              </CardContent>
            </Card>
          </div>

          {/* Management Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.title} href={category.link}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-border hover:border-primary">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                    <div className={`${category.bgColor} p-4 rounded-full ${category.color}`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{category.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
