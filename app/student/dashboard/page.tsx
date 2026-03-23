'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/layout/student-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clipboard, 
  DollarSign, 
  FileText, 
  BookOpen,
  Users,
  AlertCircle,
  Clock,
  MessageSquare
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

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'student') {
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
      title: 'Attendance',
      icon: <CheckCircle className="w-12 h-12" />,
      link: '/student/attendance',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      title: 'Notice Board',
      icon: <Clipboard className="w-12 h-12" />,
      link: '/student/notice-board',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      title: 'Fees',
      icon: <DollarSign className="w-12 h-12" />,
      link: '/student/fees',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      title: 'Study Materials',
      icon: <BookOpen className="w-12 h-12" />,
      link: '/student/study-materials',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30'
    },
    {
      title: 'Homework',
      icon: <FileText className="w-12 h-12" />,
      link: '/student/homework',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30'
    },
    {
      title: 'Faculty Info',
      icon: <Users className="w-12 h-12" />,
      link: '/student/faculty-info',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30'
    },
    {
      title: 'Syllabus',
      icon: <AlertCircle className="w-12 h-12" />,
      link: '/student/syllabus',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30'
    },
    {
      title: 'Gallery',
      icon: <Clock className="w-12 h-12" />,
      link: '/student/gallery',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      title: 'Messages',
      icon: <MessageSquare className="w-12 h-12" />,
      link: '/student/profile',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
    }
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="dashboard" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 md:ml-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome, {user.name}!</h1>
            <p className="text-muted-foreground">
              Year: <Badge className="ml-2">{user.year}</Badge>
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
