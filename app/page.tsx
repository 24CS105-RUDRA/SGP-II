'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Award, Users, BookOpen, Zap } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  const handleLoginClick = () => {
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-primary">Shree Sardar Patel Vidhyabhavan</h1>
                <p className="text-xs text-muted-foreground">School Management System</p>
              </div>
            </div>
            <Button
              onClick={handleLoginClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <Image
          src="/campus.jpg"
          alt="School Campus"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-balance">
            Excellence in Education
          </h2>
          <p className="text-lg sm:text-xl text-gray-100 mb-8 max-w-2xl text-balance">
            Empowering students with knowledge, character, and innovation for a brighter future
          </p>
          <Button
            onClick={handleLoginClick}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-primary mb-4">About Shree Sardar Patel Vidhyabhavan High School</h3>
              <p className="text-foreground/80 text-lg mb-4">
                Shree Sardar Patel Vidhyabhavan High School is a premier educational institution dedicated to nurturing
                young minds and fostering academic excellence. With state-of-the-art facilities
                and experienced faculty, we provide a comprehensive learning environment.
              </p>
              <p className="text-foreground/80 text-lg">
                Our commitment to holistic development ensures that each student grows intellectually,
                physically, and morally, prepared to face the challenges of the modern world.
              </p>
            </div>
            <Image
              src="/campus.jpg"
              alt="School Building"
              width={500}
              height={350}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-3xl font-bold text-primary text-center mb-12">Vision & Mission</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-primary">Our Vision</CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/80">
                <p>
                  To be a globally recognized institution that imparts quality education, instilling
                  values, and producing socially responsible leaders who contribute positively to society.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-accent">
              <CardHeader>
                <CardTitle className="text-accent">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/80">
                <p>
                  To provide an inclusive, nurturing educational environment that develops critical
                  thinking, fosters creativity, and prepares students for success in higher education
                  and professional endeavors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-3xl font-bold text-primary text-center mb-12">Our Achievements</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Award, label: 'National Awards', value: '15+' },
              { icon: Users, label: 'Qualified Faculty', value: '120+' },
              { icon: BookOpen, label: 'Student Enrollment', value: '2500+' },
              { icon: Zap, label: 'Years of Excellence', value: '25+' },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="text-center p-6 rounded-lg border border-border hover:border-primary transition-colors">
                  <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="text-2xl font-bold text-primary mb-2">{item.value}</p>
                  <p className="text-foreground/80">{item.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-3xl font-bold text-primary text-center mb-12">Campus Events & Activities</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <Image
                src="/gallery1.jpg"
                alt="Sports Day Event"
                width={500}
                height={300}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 bg-card">
                <h4 className="font-bold text-primary mb-2">Annual Sports Day</h4>
                <p className="text-sm text-foreground/80">
                  Students showcase their athletic talents and sportsmanship in exciting competitions.
                </p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <Image
                src="/gallery2.jpg"
                alt="Science Exhibition"
                width={500}
                height={300}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 bg-card">
                <h4 className="font-bold text-primary mb-2">Science & Tech Exhibition</h4>
                <p className="text-sm text-foreground/80">
                  Students present innovative projects demonstrating scientific knowledge and creativity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-3xl font-bold text-primary text-center mb-12">Contact Us</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Address</CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/80">
                <p>123 Education Lane</p>
                <p>City, State 12345</p>
                <p>India</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Phone</CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/80">
                <p>+91 (123) 456-7890</p>
                <p>+91 (123) 456-7891</p>
                <p>Mon - Fri: 9 AM - 5 PM</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/80">
                <p>info@archnavidhya.edu.in</p>
                <p>admissions@archnavidhya.edu.in</p>
                <p>support@archnavidhya.edu.in</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="font-bold text-lg mb-2">Shree Sardar Patel Vidhyabhavan High School</h3>
              <p className="text-sm opacity-90">Excellence in Education</p>
            </div>
            <p className="text-sm opacity-90 mt-4 md:mt-0">
              &copy; 2024 Shree Sardar Patel Vidhyabhavan High School. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
