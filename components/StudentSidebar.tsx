'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Home,
  BookOpen,
  Users,
  Calendar,
  FileText,
  ImageIcon,
  CreditCard,
  Bell,
  CheckCircle2,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

interface StudentSidebarProps {
  activeSection: string
}

export function StudentSidebar({ activeSection }: StudentSidebarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'notice-board', label: 'Notice Board', icon: Bell },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
    { id: 'study-materials', label: 'Study Materials', icon: BookOpen },
    { id: 'timetable', label: 'Time Table', icon: Calendar },
    { id: 'homework', label: 'Homework', icon: FileText },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'faculty-info', label: 'Faculty Info', icon: Users },
    { id: 'fees', label: 'Fees Details', icon: CreditCard },
  ]

  const handleLogout = () => {
    localStorage.removeItem('userSession')
    localStorage.removeItem('userRole')
    router.push('/')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-screen flex flex-col pt-20 md:pt-0">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <h2 className="text-xl font-bold text-sidebar-foreground">Student Portal</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <Link key={item.id} href={`/student/${item.id}`}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
