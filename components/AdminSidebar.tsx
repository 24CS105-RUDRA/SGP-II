'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Home,
  Users,
  GraduationCap,
  Bell,
  DollarSign,
  ImageIcon,
  Lock,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

interface AdminSidebarProps {
  activeSection: string
}

export function AdminSidebar({ activeSection }: AdminSidebarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'student-profiles', label: 'Student Profiles', icon: GraduationCap },
    { id: 'faculty-profiles', label: 'Faculty Profiles', icon: Users },
    { id: 'faculty-class-management', label: 'Faculty Class Management', icon: Users },
    { id: 'notices', label: 'General Notices', icon: Bell },
    { id: 'fees', label: 'Fees Management', icon: DollarSign },
    { id: 'gallery', label: 'Gallery Management', icon: ImageIcon },
    { id: 'password-management', label: 'Password Management', icon: Lock },
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
            <h2 className="text-xl font-bold text-sidebar-foreground">Admin Portal</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <Link key={item.id} href={`/admin/${item.id}`}>
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
