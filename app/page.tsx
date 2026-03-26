'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SchoolInfoPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  const carouselImages = [
    { src: '/campus.jpg', alt: 'School Campus' },
    { src: '/gallery1.jpg', alt: 'Campus Events' },
    { src: '/gallery2.jpg', alt: 'Activities' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleLoginClick = () => {
    router.push('/login')
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 gap-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">Shree Sardar Patel <span className="text-accent">Vidhya Sankul</span></h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Santokba Dholakiya Educational Campus · Managed by Shree Saurashtra Leuva Patel Seva Samaj, Navsari</p>
              </div>
            </div>
            <Button
              onClick={handleLoginClick}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap font-semibold text-base"
            >
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Navigation Menu Bar */}
      <nav className="sticky top-24 z-40 border-b border-border bg-card">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 h-14">
            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
              Home
            </button>
            <a href="#about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#programs" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Education
            </a>
            <a href="#activities" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Activities
            </a>
            <a href="#achievements" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Achievements
            </a>
            <a href="#contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Auto-Sliding Carousel */}
      <section id="carousel" className="py-8 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="relative w-full h-96 sm:h-[500px] lg:h-[600px] overflow-hidden bg-black rounded-lg">
            {carouselImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
            
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">1,000+</div>
                <p className="text-xs sm:text-sm text-foreground/80">Students Currently Enrolled</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">980</div>
                <p className="text-xs sm:text-sm text-foreground/80">Students Got Education</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">50</div>
                <p className="text-xs sm:text-sm text-foreground/80">B.Ed. Graduates Trained</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">45</div>
                <p className="text-xs sm:text-sm text-foreground/80">Bed Hospital (Concessional)</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">29,473</div>
                <p className="text-xs sm:text-sm text-foreground/80">OPD Patients Served in a Year</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">5,000+</div>
                <p className="text-xs sm:text-sm text-foreground/80">Blood Bottles Donated via Red Cross</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">200+</div>
                <p className="text-xs sm:text-sm text-foreground/80">Families Benefited via Samuh Lagna</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">50</div>
                <p className="text-xs sm:text-sm text-foreground/80">Tribal Girls Staying in Free Hostel</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 mb-6">
            <div className="text-3xl">🏫</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">About Us</h2>
              <p className="text-sm text-foreground/60">Who we are and what we stand for</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4 text-foreground/80">
              <p className="text-base leading-relaxed">
                The <strong>Leuva Patel community</strong>, originally from Saurashtra, migrated to the Navsari region of South Gujarat for fringe earning purposes. Though economically humble, the community is well known for its <strong>hard work, dedication, and patriotism</strong> to the state and nation.
              </p>
              <p className="text-base leading-relaxed">
                For over <strong>50 years</strong>, the Shree Saurashtra Leuva Patel Seva Samaj has devoted its well-being to the upliftment of families and the broader community. The people have started imparting school and college education to their children at any cost — driven entirely by <strong>dedicated volunteers of the Samaj</strong>.
              </p>
              <p className="text-base leading-relaxed">
                The surrounding area is dominated by the <strong>diamond cutting industry</strong>, where families have marginal income. Around 60% of children used to leave studies after primary school to support their parents financially. Through the noble idea of supporting such marginal families, the trust established this school, and as a result, <strong>children forcibly leaving study have stopped and education has substantially increased.</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Educational Programs */}
      <section id="programs" className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 mb-8">
            <div className="text-3xl">🎓</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Educational Programs</h2>
              <p className="text-sm text-foreground/60">Santokba Dholakiya Educational Campus — Shree Sardar Patel Vidhya Sankul</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-primary">
              <CardHeader>
                <CardTitle className="text-primary">📚 School Education</CardTitle>
                <CardDescription>Nursery to Std 12</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/80">
                  A comprehensive school offering education from Pre-primary all the way through Higher Secondary in both <strong>Gujarati and English medium</strong>, with well-trained and learned teachers.
                </p>
                <ul className="space-y-2">
                  {['Pre-Primary: Playgroup, Jr. KG & Sr. KG', 'Primary School: Std 1 to 8', 'Secondary Section: Std 9 to 10', 'Higher Secondary (Commerce): Std 11 to 12', 'Spacious well-furnished rooms', 'Science & Computer Laboratories', 'Smart Room for technological study'].map((item, idx) => (
                    <li key={idx} className="text-sm text-foreground/80 flex gap-2">
                      <span className="text-primary">→</span> {item}
                    </li>
                  ))}
                </ul>
                <div className="bg-primary/10 p-3 rounded-lg text-sm text-foreground/80 mt-4">
                  <strong>~1,000 students</strong> currently taking advantage of school education through well-trained teachers.
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-accent">
              <CardHeader>
                <CardTitle className="text-accent">🏛️ B.Ed. College</CardTitle>
                <CardDescription>Teacher Training</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/80">
                  <strong>Shree Sardar Patel College of Education</strong> is run by Shree Saurashtra Leuva Patel Seva Samaj on a self-finance basis. The aim is to provide <strong>well-trained teachers for society</strong>.
                </p>
                <ul className="space-y-2">
                  {['Graduate & Post-Graduate students admitted for teacher training', 'Located near Navsari Railway Station (west side)', 'Easily accessible from surrounding villages and Navsari city', 'Wide-spaced building surrounded by wide ground', 'Facilities to match the imaginations of the elites', 'Silent, peaceful environment ideal for study'].map((item, idx) => (
                    <li key={idx} className="text-sm text-foreground/80 flex gap-2">
                      <span className="text-accent">→</span> {item}
                    </li>
                  ))}
                </ul>
                <div className="bg-accent/10 p-3 rounded-lg text-sm text-foreground/80 mt-4">
                  <strong>50 well-trained teachers</strong> produced who are now serving society.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Health Activities */}
      <section id="activities" className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 mb-8">
            <div className="text-3xl">🏥</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Health Related Activities</h2>
              <p className="text-sm text-foreground/60">Sarvjanik Hospital — Running at Concessional Rates</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="border-l-4 border-green-600">
              <CardHeader>
                <CardTitle className="text-green-600">🏥 Running Hospital</CardTitle>
                <CardDescription>45 Beds · ₹100/Visit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/80">
                  A <strong>full-fledged 45-bed hospital</strong> running on a concessional basis with highly qualified specialized doctors providing services at a very nominal charge of <strong>₹100/-</strong>.
                </p>
                <ul className="space-y-2">
                  {['General Ward', 'Female Ward', 'Special & Semi Special Rooms', 'Fully Equipped Operation Theatre', 'Pathological Laboratory', 'Digital X-Ray', 'Sonography Machine', 'Laparoscopy Equipment', 'Photo Therapy Machine', 'Complete Labour Room Equipment'].map((item, idx) => (
                    <li key={idx} className="text-sm text-foreground/80 flex gap-2">
                      <span className="text-green-600">→</span> {item}
                    </li>
                  ))}
                </ul>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-sm text-foreground/80 mt-4">
                  During COVID-19, treatment was provided with <strong>almost zero charge</strong>, reducing the government burden significantly.
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-cyan-600">
              <CardHeader>
                <CardTitle className="text-cyan-600">🩸 Paramedical & Camps</CardTitle>
                <CardDescription>Blood Donation · Eye Care</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/80">
                  Various health awareness and support activities organized to serve the community beyond the hospital walls.
                </p>
                <ul className="space-y-2">
                  {['Blood Donation Camps — 5,000+ bottles collected via Red Cross Society', 'Youths are ready for emergency blood calls at all times', 'Eye testing and free spectacle distribution camps', 'Hygienic food and nutrition awareness programs', 'Health check-up camp for pregnant ladies', 'Medical aid to poor and indoor patients'].map((item, idx) => (
                    <li key={idx} className="text-sm text-foreground/80 flex gap-2">
                      <span className="text-cyan-600">→</span> {item}
                    </li>
                  ))}
                </ul>
                <div className="bg-cyan-50 dark:bg-cyan-950 p-3 rounded-lg text-sm text-foreground/80 mt-4">
                  Youths honored by other organizations for their dedication to blood donation service.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hospital Stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-foreground mb-4">Hospital Annual Statistics (Benefits in One Year)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { num: '29,473', label: 'OPD Patients' },
                { num: '1,720', label: 'IPD Patients' },
                { num: '722', label: 'Child Deliveries' },
                { num: '322', label: 'Surgical Operations' },
                { num: '380', label: 'Blood Bottles' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-primary mb-1">{stat.num}</div>
                  <div className="text-xs text-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Group Marriages */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 mb-8">
            <div className="text-3xl">💒</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Group Marriages — Samuh Lagna</h2>
              <p className="text-sm text-foreground/60">Reducing the financial burden on poor families</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4 text-foreground/80">
              <p className="text-base leading-relaxed">
                Individual marriage ceremonies cost more than many families can afford, affecting their daily life and children's education. The Samaj organizes <strong>Group Marriages (Samuh Lagna)</strong> in which <strong>all expenses of the marriage are borne by the Samaj</strong> through donors.
              </p>
              <p className="text-base leading-relaxed">
                This gives great relief to parents and has proven to be a great blessing. So far, <strong>15 Samuh Lagnas</strong> have been organized, where <strong>more than 200 families</strong> have taken benefit. In the last Samuh Lagna, 13 couples benefitted directly.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Hostel for Adivasi Girls */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 mb-8">
            <div className="text-3xl">🏠</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Hostel for Adivasi Girls</h2>
              <p className="text-sm text-foreground/60">Adivasi Kanya Chhatralaya — Free food, residence & transportation</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4 text-foreground/80">
              <p className="text-base leading-relaxed">
                The trust runs an <strong>Adivasi Kanya Chhatralaya</strong> on campus exclusively for Adivasi (tribal) girls. Girls studying at <strong>primary, secondary, higher secondary, or college level</strong> are admitted.
              </p>
              <p className="text-base leading-relaxed">
                Residents are provided with <strong>free food, free residence, and even free transportation</strong> from their homes to the hostel. All expenditure is sponsored by <strong>N.J. Investment Pvt. Ltd.</strong>
              </p>
              <p className="text-base leading-relaxed">
                This initiative has been life-changing: in tribal areas where lack of facilities causes children to leave study, this hostel has ensured that <strong>50 tribal girls could continue their education</strong> uninterrupted.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Other Community Activities - Chips */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 mb-8">
            <div className="text-3xl">✦</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Other Community Activities</h2>
              <p className="text-sm text-foreground/60">Ongoing programs run by Samaj volunteers</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              'Blood Donation Camps',
              'Eye Testing & Free Spectacles',
              'Health & Hygiene Camps',
              'Natural Calamity Relief',
              'Religious Functions',
              'Diara (Folksong) Programs',
              'Book & Notebook Distribution',
              'Youth Activities',
              'Anti-Superstition Campaigns',
              'Yoga & Personality Development',
              'Sports & Games',
              'Career Development Programs',
              'Triranga Yatra',
              'Annual Day Celebration',
              'Prakharta Shodh Kasoti',
              'Literature of Art & Cultural Activities',
            ].map((activity, idx) => (
              <span key={idx} className="inline-block bg-card border border-border px-4 py-2 rounded-full text-sm text-foreground/80">
                ✦ {activity}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Activities & Outcomes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 mb-8">
            <div className="text-3xl">📊</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Activities & Outcomes</h2>
              <p className="text-sm text-foreground/60">Implementation and measured benefits of programs</p>
            </div>
          </div>
          
          {/* Outcomes Table Structure */}
          <div className="border border-border rounded-lg overflow-hidden bg-white dark:bg-slate-950">
            {/* Header Row */}
            <div className="grid grid-cols-2 border-b border-border bg-primary text-primary-foreground">
              <div className="px-6 py-4 text-sm font-semibold uppercase tracking-wide">Activity & Implementation</div>
              <div className="px-6 py-4 text-sm font-semibold uppercase tracking-wide">Benefits / Outcomes</div>
            </div>

            {/* Data Rows */}
            {[
              {
                title: 'School & College Activities',
                activities: [
                  'Running school from pre-primary to higher secondary',
                  'Literature of Art & Cultural Activities',
                  'Yoga and Personality Development',
                  'Career Development programs',
                  'Sports and Games',
                  'Prakharta Shodh Kasoti',
                ],
                benefits: [
                  '980 students received education from pre-primary to higher secondary',
                  '50 students passed out with B.Ed. degree',
                  'Triranga Yatra observed on Republic and Independence Day',
                  '950 students performed yoga on 21st June',
                  'Celebration of Annual Day',
                  'Gold medal awarded to handball winners',
                ],
              },
              {
                title: 'Health Activities',
                activities: [
                  'Running Sarvajanik Hospital',
                  'Blood Donation Camps',
                  'Health check-up camp for pregnant ladies',
                  'Medical aid to poor patients',
                  'Dikari Vadhavo Yojana bond distribution',
                ],
                benefits: [
                  'OPD patients: 29,473',
                  'IPD patients: 1,720',
                  'Child deliveries: 722',
                  'Surgical operations: 322',
                  'Blood bottles collected: 380',
                  'Health check-up beneficiaries: 29',
                  'Financial medical aid from 4 charitable trusts to 1,264 patients',
                  '776 Dikari Vadhavo Yojana bonds given (₹5,000 each) to mothers',
                ],
              },
              {
                title: 'Group Marriages',
                activities: ['Organized 15th Samuh Lagna Samaroh'],
                benefits: [
                  '200+ couples participated in all Samuh Lagnas',
                  'In the last Samuh Lagna, 13 couples benefitted directly',
                ],
              },
              {
                title: 'Hostel for Adivasi Girls',
                activities: [
                  'Management of Kanya Chhatralaya for ST/SC/OBC/Adivasi girls',
                  'In collaboration with N.J. Investment Pvt. Ltd. as sponsor',
                ],
                benefits: [
                  '50 SC/ST/OBC/Adivasi girl students benefitted with free food, residence, and transportation',
                ],
              },
            ].map((section, idx) => (
              <div key={idx} className="grid grid-cols-2 border-b border-border last:border-b-0">
                {/* Left Column - Activity & Implementation */}
                <div className="px-6 py-6 bg-primary/5 border-r border-border">
                  <div className="text-sm font-semibold text-foreground mb-3">{section.title}</div>
                  <ul className="space-y-2">
                    {section.activities.map((activity, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex gap-2">
                        <span className="text-primary flex-shrink-0 mt-1">→</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Column - Benefits / Outcomes */}
                <div className="px-6 py-6 bg-background">
                  <div className="text-sm font-semibold text-foreground mb-3">Benefits / Outcomes</div>
                  <ul className="space-y-2">
                    {section.benefits.map((benefit, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex gap-2">
                        <span className="text-primary flex-shrink-0 mt-1">→</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Achievements */}
      <section id="achievements" className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 mb-12">
            <div className="text-3xl">🏆</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Special Achievements</h2>
              <p className="text-sm text-foreground/60">Notable milestones of the Samaj's work</p>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              {
                icon: '🎓',
                text: '50 well-trained teachers produced through the B.Ed. college who are now actively serving society.',
              },
              {
                icon: '🥇',
                text: 'School students won 30 Gold Medals at National Level, 1 Silver Medal, and 2 Bronze Medals at Zonal Level.',
              },
              {
                icon: '🏥',
                text: '29,473 OPD and 1,720 IPD patients took benefit of concessional medical service. 951 indoor patients received financial relief of ₹11,26,173.',
              },
              {
                icon: '👧',
                text: '776 five-year bonds of ₹5,000 each given to girl children born at the hospital — total amounting to ₹38,80,000/- under Dikari Vadhavo Yojana.',
              },
              {
                icon: '💒',
                text: '13 couples benefitted from Samuh Lagna in the latest ceremony, which saved a huge amount of money for poor parents.',
              },
              {
                icon: '📚',
                text: '50 tribal girls staying in the hostel were able to continue their studies — who would otherwise have dropped out due to lack of facilities.',
              },
            ].map((achievement, idx) => (
              <li key={idx} className="flex gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all">
                <div className="flex-shrink-0 flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="text-xl mt-0.5">{achievement.icon}</div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm text-foreground/80 leading-relaxed">{achievement.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Benefits to Society */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 mb-8">
            <div className="text-3xl">🌱</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Benefits to Society</h2>
              <p className="text-sm text-foreground/60">Direct and indirect impact on the community</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: '📉',
                title: 'Reduced School Dropout Rate',
                text: 'The school dropout rate was around 60% due to children joining the diamond industry. School activities have reduced this to just 10–15%, keeping children in education.',
              },
              {
                icon: '🏥',
                title: 'Affordable Healthcare',
                text: 'Hospital running at reduced rates has benefitted thousands of poor people. During COVID-19, treatment was given with almost zero charge.',
              },
              {
                icon: '🎓',
                title: 'Quality Teachers for Society',
                text: 'The B.Ed. college provides well-trained teachers to society and the government. Graduates go on to teach in schools and colleges across the region.',
              },
              {
                icon: '💒',
                title: 'Financial Relief via Samuh Lagna',
                text: 'Group marriages save poor families from taking loans. The Samaj bears all marriage expenses through donor funding.',
              },
            ].map((benefit, idx) => (
              <Card key={idx} className="p-6">
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-foreground/80">{benefit.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3 mb-8">
            <div className="text-3xl">📞</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Contact Us</h2>
              <p className="text-sm text-foreground/60">Get in touch with us for more information</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">📍 Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground/80">
                  <strong>Santokba Dholakiya Educational Campus</strong><br/>
                  Shree Sardar Patel Vidhya Sankul<br/>
                  Near Navsari Railway Station (West Side)<br/>
                  Navsari, Gujarat
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">📧 Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground/80">
                  <strong>Email:</strong><br/>
                  contact@sardarpatelvid.edu<br/><br/>
                  <strong>Phone:</strong><br/>
                  For general inquiries and admissions
                </p>
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
              <h3 className="font-bold text-lg mb-2">Shree Sardar Patel Vidhya Sankul</h3>
              <p className="text-sm opacity-90">Est. 50+ Years of Service | Santokba Dholakiya Educational Campus</p>
            </div>
            <p className="text-sm opacity-90 mt-4 md:mt-0">
              &copy; 2024 Shree Sardar Patel Vidhya Sankul. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

