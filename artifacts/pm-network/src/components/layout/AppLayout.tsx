import * as React from "react"
import { Link, useLocation } from "wouter"
import { LayoutDashboard, Compass, BookOpen, Calendar, Users, Upload, LogIn } from "lucide-react"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()

  return (
    <div className="flex min-h-[100dvh] w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-card">
        <div className="flex h-14 items-center px-6 font-semibold tracking-tight text-primary">
          PM Network
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          <NavItem href="/" icon={LayoutDashboard} active={location === "/"}>Feed</NavItem>
          <NavItem href="/explore" icon={Compass} active={location === "/explore" || location.startsWith("/decks/")}>Explore</NavItem>
          <NavItem href="/courses" icon={BookOpen} active={location === "/courses"}>Courses</NavItem>
          <NavItem href="/events" icon={Calendar} active={location === "/events"}>Events</NavItem>
          <NavItem href="/network" icon={Users} active={location === "/network" || location.startsWith("/profile/")}>Network</NavItem>
        </nav>
        <div className="p-4 border-t">
          <Link href="/upload" className="flex items-center gap-3 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mb-2">
            <Upload className="h-4 w-4" />
            Upload Deck
          </Link>
          <Link href="/profile/1" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <LogIn className="h-4 w-4" />
            Profile (Demo User 1)
          </Link>
        </div>
      </aside>
      <main className="flex-1 pl-64">
        {children}
      </main>
    </div>
  )
}

function NavItem({ href, icon: Icon, active, children }: { href: string, icon: React.ElementType, active: boolean, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}