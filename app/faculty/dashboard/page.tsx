'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FacultySidebar } from '@/components/FacultySidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Bell,
  DollarSign,
  FileText,
  Calendar,
  BookOpen,
  Users,
  Clock,
  ImageIcon,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface UserSession {
  username: string
  name: string
  role: string
  year: string
}

interface Category {
  title: string
  icon: React.ReactNode
  link: string
  color: string
  bgColor: string
}

export default function FacultyDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'faculty') {
      router.push('/login')
      return
    }

    setUser(JSON.parse(session))
    setLoading(false)
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) return null

  const categories: Category[] = [
    {
      title: 'Mark Attendance',
      icon: <CheckCircle className="w-12 h-12" />,
      link: '/faculty/attendance',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      title: 'Post Notices',
      icon: <Bell className="w-12 h-12" />,
      link: '/faculty/notices',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      title: 'Manage Students',
      icon: <Users className="w-12 h-12" />,
      link: '/faculty/student-management',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      title: 'Post Homework',
      icon: <FileText className="w-12 h-12" />,
      link: '/faculty/homework',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30'
    },
    {
      title: 'Upload Materials',
      icon: <BookOpen className="w-12 h-12" />,
      link: '/faculty/study-materials',
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/30'
    },
    {
      title: 'Manage Timetable',
      icon: <Calendar className="w-12 h-12" />,
      link: '/faculty/timetable',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30'
    },
    {
      title: 'Update Syllabus',
      icon: <BarChart3 className="w-12 h-12" />,
      link: '/faculty/syllabus',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30'
    },
    {
      title: 'Upload Gallery',
      icon: <ImageIcon className="w-12 h-12" />,
      link: '/faculty/gallery',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30'
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar activeSection="dashboard" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 md:ml-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome, {user.name}!</h1>
            <p className="text-muted-foreground">
              Faculty Dashboard - Manage your classes and content
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.title} href={category.link}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-border hover:border-primary">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                    <div className={`${category.bgColor} p-4 rounded-full ${category.color}`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{category.title}</h3>
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
