import { useState } from "react"
import { Link, useParams } from "wouter"
import { useQueryClient } from "@tanstack/react-query"
import { 
  useGetUser, 
  useGetUserDecks, 
  useGetUserStarred, 
  useFollowUser,
  getGetUserQueryKey 
} from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, Link as LinkIcon, Calendar, Star, Eye, BarChart3, UserPlus, Users } from "lucide-react"

export default function Profile() {
  const params = useParams()
  const id = params.id ? parseInt(params.id) : 1
  const queryClient = useQueryClient()

  const { data: user, isLoading: userLoading } = useGetUser(id, {
    query: { enabled: !!id, queryKey: getGetUserQueryKey(id) }
  })
  
  const { data: decks, isLoading: decksLoading } = useGetUserDecks(id, {
    query: { enabled: !!id }
  })
  
  const { data: starredDecks, isLoading: starredLoading } = useGetUserStarred(id, {
    query: { enabled: !!id }
  })

  const followMutation = useFollowUser({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetUserQueryKey(id), (old: any) => 
          old ? { ...old, followers: data.followerCount } : old
        )
      }
    }
  })

  const handleFollow = () => {
    followMutation.mutate({ id, data: { followerId: 1 } }) // Hardcoded current user as 1
  }

  if (userLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex gap-8 items-start">
          <Skeleton className="h-32 w-32 rounded-full shrink-0" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">User not found</div>
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-16">
      {/* Profile Header */}
      <div className="p-8 border-b bg-card">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Avatar className="h-32 w-32 border-4 border-background shadow-lg ring-1 ring-border/50 shrink-0">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                <div className="text-primary font-medium tracking-wide">@{user.username}</div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleFollow} className="gap-2 w-full md:w-auto">
                  <UserPlus className="h-4 w-4" /> Follow
                </Button>
              </div>
            </div>

            {user.bio && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {user.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-muted-foreground font-medium pt-2 border-t">
              {user.title && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {user.title} {user.company && `at ${user.company}`}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
                <Users className="h-4 w-4" />
                <span className="font-bold text-foreground">{user.followers || 0}</span> followers
              </div>
              <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
                <span className="font-bold text-foreground">{user.following || 0}</span> following
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-8">
        <Tabs defaultValue="uploads" className="w-full">
          <TabsList className="mb-8 p-1 bg-muted/50 h-auto">
            <TabsTrigger value="uploads" className="py-2.5 px-6 gap-2 text-base">
              Decks <Badge variant="secondary" className="ml-1 px-1.5">{user.deckCount || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="starred" className="py-2.5 px-6 gap-2 text-base">
              <Star className="h-4 w-4" /> Starred
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="uploads" className="mt-0">
            {decksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
              </div>
            ) : decks?.length === 0 ? (
              <div className="text-center py-24 bg-muted/30 rounded-xl border border-dashed">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">No decks uploaded yet</h3>
                <p className="text-muted-foreground mt-1">This user hasn't shared any work.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks?.map(deck => <DeckCard key={deck.id} deck={deck} />)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="starred" className="mt-0">
            {starredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
              </div>
            ) : starredDecks?.length === 0 ? (
              <div className="text-center py-24 bg-muted/30 rounded-xl border border-dashed">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">No starred decks</h3>
                <p className="text-muted-foreground mt-1">This user hasn't starred anything yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {starredDecks?.map(deck => <DeckCard key={deck.id} deck={deck} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function DeckCard({ deck }: { deck: any }) {
  return (
    <Link href={`/decks/${deck.id}`}>
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
            {deck.tags?.slice(0, 3).map((t: string) => (
              <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
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
  )
}