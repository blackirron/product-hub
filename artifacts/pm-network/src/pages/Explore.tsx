import { useState } from "react"
import { Link } from "wouter"
import { useListDecks } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Star, Eye, Search, Filter, BarChart3 } from "lucide-react"

export default function Explore() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortBy, setSortBy] = useState<"stars" | "views" | "newest">("stars")
  const [tag, setTag] = useState("")

  // Quick debounce for search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    // In a real app we'd use a real useDebounce hook, using simple timeout here for safety
    setTimeout(() => setDebouncedSearch(e.target.value), 300)
  }

  const { data: decks, isLoading } = useListDecks({
    search: debouncedSearch || undefined,
    sortBy,
    tag: tag || undefined,
    limit: 24
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Explore Decks</h1>
        <p className="text-muted-foreground text-lg">Browse case studies, teardowns, and strategy presentations from top PMs.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search presentations..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:border-primary"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button 
            variant={sortBy === "stars" ? "default" : "secondary"} 
            size="sm" 
            onClick={() => setSortBy("stars")}
          >
            Most Starred
          </Button>
          <Button 
            variant={sortBy === "newest" ? "default" : "secondary"} 
            size="sm" 
            onClick={() => setSortBy("newest")}
          >
            Newest
          </Button>
          <Button 
            variant={sortBy === "views" ? "default" : "secondary"} 
            size="sm" 
            onClick={() => setSortBy("views")}
          >
            Most Viewed
          </Button>
          <div className="h-9 w-px bg-border mx-2"></div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setTag("")}>
            <Filter className="h-4 w-4" />
            {tag ? `Tag: ${tag}` : "All Tags"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      ) : decks?.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No decks found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {decks?.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <Card className="h-full hover-elevate transition-shadow cursor-pointer flex flex-col">
                <div className="aspect-video bg-muted relative overflow-hidden rounded-t-xl border-b">
                  {deck.thumbnailUrl ? (
                    <img src={deck.thumbnailUrl} alt={deck.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-primary/5">
                      <BarChart3 className="h-12 w-12 opacity-20" />
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="line-clamp-2 text-base leading-tight min-h-[2.5rem]">{deck.title}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={deck.authorAvatarUrl || undefined} />
                      <AvatarFallback>{deck.authorName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{deck.authorName}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1">
                  <div className="flex flex-wrap gap-1 mt-2">
                    {deck.tags?.slice(0, 3).map(t => (
                      <Badge 
                        key={t} 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-primary/20"
                        onClick={(e) => {
                          e.preventDefault()
                          setTag(t)
                        }}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground mt-auto">
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
      )}
    </div>
  )
}