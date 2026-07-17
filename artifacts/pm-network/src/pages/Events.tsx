import { useState } from "react"
import { useListEvents } from "@workspace/api-client-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Search, MapPin, Trophy, ArrowUpRight, Clock } from "lucide-react"

export default function Events() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [type, setType] = useState<string>("")
  const [upcomingOnly, setUpcomingOnly] = useState(true)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setTimeout(() => setDebouncedSearch(e.target.value), 300)
  }

  const { data: events, isLoading } = useListEvents({
    search: debouncedSearch || undefined,
    type: type as any || undefined,
    upcoming: upcomingOnly,
    limit: 50
  })

  const typeLabels = {
    case_comp: "Case Competition",
    pm_event: "PM Event",
    workshop: "Workshop",
    conference: "Conference"
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Events & Datesheet</h1>
        <p className="text-muted-foreground text-lg">Never miss a case competition, hackathon, or PM conference.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:border-primary"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button 
            variant={type === "" ? "default" : "secondary"} 
            size="sm" 
            onClick={() => setType("")}
          >
            All Events
          </Button>
          <Button 
            variant={type === "case_comp" ? "default" : "secondary"} 
            size="sm" 
            onClick={() => setType("case_comp")}
          >
            Case Comps
          </Button>
          <Button 
            variant={type === "conference" ? "default" : "secondary"} 
            size="sm" 
            onClick={() => setType("conference")}
          >
            Conferences
          </Button>
          <div className="h-9 w-px bg-border mx-2"></div>
          <Button 
            variant={upcomingOnly ? "default" : "outline"} 
            size="sm" 
            onClick={() => setUpcomingOnly(!upcomingOnly)}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Upcoming Only
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl w-full" />)}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="text-muted-foreground mt-1">Try expanding your search criteria</p>
        </div>
      ) : (
        <div className="space-y-6">
          {events?.map((event) => {
            const date = new Date(event.eventDate)
            const monthStr = date.toLocaleDateString(undefined, { month: 'short' })
            const dayStr = date.toLocaleDateString(undefined, { day: 'numeric' })
            const isCaseComp = event.type === 'case_comp'
            
            return (
              <Card key={event.id} className={`flex flex-col md:flex-row overflow-hidden hover-elevate transition-shadow ${isCaseComp ? 'border-primary/30 shadow-[0_0_15px_-3px_rgba(90,103,216,0.1)]' : ''}`}>
                <div className="md:w-32 bg-muted/50 flex md:flex-col items-center justify-center p-4 md:border-r border-b md:border-b-0 border-border">
                  <div className="text-center flex flex-row md:flex-col gap-2 md:gap-0 items-baseline md:items-center">
                    <span className="text-sm font-semibold text-primary uppercase tracking-widest">{monthStr}</span>
                    <span className="text-3xl font-bold tracking-tighter">{dayStr}</span>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={isCaseComp ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider py-0">
                            {typeLabels[event.type as keyof typeof typeLabels] || event.type}
                          </Badge>
                          {event.host && (
                            <span className="text-xs font-medium text-muted-foreground border-l pl-2 border-border">
                              Hosted by {event.host}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                      </div>
                      
                      {event.url && (
                        <Button variant="outline" size="sm" asChild className="hidden md:flex shrink-0">
                          <a href={event.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                            Details <ArrowUpRight className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                    
                    {event.description && (
                      <CardDescription className="line-clamp-2 mt-2 max-w-3xl">
                        {event.description}
                      </CardDescription>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 pt-4 border-t border-border">
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-foreground/50" />
                        {event.location}
                      </div>
                    )}
                    
                    {event.prize && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        Prize: {event.prize}
                      </div>
                    )}
                    
                    {event.registrationDeadline && (
                      <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                        <Clock className="h-4 w-4" />
                        Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {event.url && (
                    <Button variant="outline" size="sm" asChild className="md:hidden mt-4 w-full">
                      <a href={event.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                        Details <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}