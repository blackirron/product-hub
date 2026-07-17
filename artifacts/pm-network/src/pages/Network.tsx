import { useState } from "react"
import { Link } from "wouter"
import { useListUsers } from "@workspace/api-client-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Briefcase, BookOpen, Users as UsersIcon } from "lucide-react"

export default function Network() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setTimeout(() => setDebouncedSearch(e.target.value), 300)
  }

  const { data: users, isLoading } = useListUsers({
    search: debouncedSearch || undefined,
    limit: 30
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">PM Network</h1>
        <p className="text-muted-foreground text-lg">Connect with product managers, strategists, and builders.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, company, or title..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:border-primary"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="text-sm text-muted-foreground hidden md:block">
          Showing newest members first
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(12).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : users?.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No members found</h3>
          <p className="text-muted-foreground mt-1">No one matches that search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users?.map((user) => (
            <Link key={user.id} href={`/profile/${user.id}`}>
              <Card className="h-full text-center hover-elevate transition-shadow cursor-pointer border-transparent bg-muted/30 hover:bg-card hover:border-border">
                <CardHeader className="flex flex-col items-center gap-2 pb-2">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-sm ring-1 ring-border/50">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 mt-2">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <div className="text-xs text-primary font-medium tracking-wide">@{user.username}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(user.title || user.company) && (
                    <div className="text-sm text-muted-foreground flex flex-col items-center justify-center gap-1">
                      {user.title && <span className="font-medium text-foreground/80">{user.title}</span>}
                      {user.company && (
                        <span className="flex items-center gap-1 text-xs">
                          <Briefcase className="h-3 w-3" /> {user.company}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {user.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold">{user.followers || 0}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Followers</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold">{user.deckCount || 0}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Decks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}