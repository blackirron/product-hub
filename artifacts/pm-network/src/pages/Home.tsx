import { Link } from "wouter"
import { useGetTrendingDecks, useGetPlatformStats, useGetUpcomingEvents } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Eye, Calendar, ArrowRight, TrendingUp, BarChart3, BookOpen, Users } from "lucide-react"

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetPlatformStats()
  const { data: trendingDecks, isLoading: decksLoading } = useGetTrendingDecks({ limit: 6 })
  const { data: upcomingEvents, isLoading: eventsLoading } = useGetUpcomingEvents({ limit: 4 })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to PM Network</h1>
        <p className="text-muted-foreground text-lg">Discover top product management work, resources, and events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : stats ? (
          <>
            <StatCard title="Total Users" value={stats.userCount} icon={Users} />
            <StatCard title="Decks Uploaded" value={stats.deckCount} icon={BookOpen} />
            <StatCard title="Events" value={stats.eventCount} icon={Calendar} />
            <StatCard title="Stars Given" value={stats.starCount} icon={Star} />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Trending Decks
            </h2>
            <Link href="/explore" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decksLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
            ) : trendingDecks?.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <Card className="h-full hover-elevate transition-shadow cursor-pointer flex flex-col">
                  <div className="aspect-video bg-muted relative overflow-hidden rounded-t-xl">
                    {deck.thumbnailUrl ? (
                      <img src={deck.thumbnailUrl} alt={deck.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-primary/5">
                        <BarChart3 className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="line-clamp-1">{deck.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={deck.authorAvatarUrl || undefined} />
                        <AvatarFallback>{deck.authorName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span>{deck.authorName}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-1">
                    <div className="flex flex-wrap gap-1 mt-2">
                      {deck.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 border-t flex justify-between text-xs text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5" /> {deck.stars}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> {deck.views}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Upcoming Events
            </h2>
            <Link href="/events" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {eventsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : upcomingEvents?.map((event) => (
              <Card key={event.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base line-clamp-2 leading-tight">
                      {event.title}
                    </CardTitle>
                    <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                      {event.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs font-medium text-primary mt-1">
                    {new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {event.location && ` • ${event.location}`}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
            
            {upcomingEvents?.length === 0 && !eventsLoading && (
              <div className="text-center p-8 bg-muted rounded-xl border border-dashed">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No upcoming events right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground opacity-50" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  )
}