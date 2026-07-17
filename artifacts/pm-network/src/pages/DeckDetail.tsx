import { Link, useParams } from "wouter"
import { useGetDeck, useStarDeck, getGetDeckQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Eye, Calendar, Share2, Download, BarChart3, ChevronLeft } from "lucide-react"

export default function DeckDetail() {
  const params = useParams()
  const id = params.id ? parseInt(params.id) : 0
  const queryClient = useQueryClient()
  
  const { data: deck, isLoading } = useGetDeck(id, {
    query: { enabled: !!id, queryKey: getGetDeckQueryKey(id) }
  })

  const starMutation = useStarDeck({
    mutation: {
      onSuccess: (data) => {
        // Optimistic cache update
        queryClient.setQueryData(getGetDeckQueryKey(id), (old: any) => 
          old ? { ...old, stars: data.starCount } : old
        )
      }
    }
  })

  const handleStar = () => {
    // Assuming logged in as user 1 for demo purposes
    starMutation.mutate({ id, data: { userId: 1 } })
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-12 w-2/3" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    )
  }

  if (!deck) {
    return <div className="p-8 text-center text-muted-foreground">Deck not found</div>
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-8 py-4 flex items-center justify-between">
        <Link href="/explore" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Explore
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleStar}>
            <Star className={`h-4 w-4 ${starMutation.isPending ? 'animate-pulse' : ''}`} /> 
            Star ({deck.stars})
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Presentation Viewer Area */}
        <div className="aspect-video bg-muted rounded-xl border overflow-hidden relative shadow-sm">
          {deck.fileUrl ? (
            <iframe 
              src={deck.fileUrl} 
              className="w-full h-full border-0"
              title={deck.title}
              allowFullScreen
            />
          ) : deck.thumbnailUrl ? (
            <img src={deck.thumbnailUrl} alt={deck.title} className="w-full h-full object-contain bg-black/5" />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground bg-primary/5">
              <BarChart3 className="h-16 w-16 opacity-20 mb-4" />
              <p>No preview available</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-4">{deck.title}</h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {deck.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="font-mono text-xs py-1">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p>{deck.description || "No description provided for this deck."}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-card rounded-xl border shadow-sm">
              <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">Author</h3>
              <Link href={`/profile/${deck.userId}`} className="flex items-center gap-3 group">
                <Avatar className="h-12 w-12 border-2 border-background group-hover:border-primary transition-colors">
                  <AvatarImage src={deck.authorAvatarUrl || undefined} />
                  <AvatarFallback>{deck.authorName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium group-hover:text-primary transition-colors">{deck.authorName}</div>
                  <div className="text-xs text-muted-foreground">@{deck.authorUsername}</div>
                </div>
              </Link>
            </div>

            <div className="p-6 bg-card rounded-xl border shadow-sm space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Details</h3>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Uploaded</span>
                <span className="font-medium">{new Date(deck.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Eye className="h-4 w-4" /> Views</span>
                <span className="font-medium">{deck.views.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Star className="h-4 w-4" /> Stars</span>
                <span className="font-medium">{deck.stars.toLocaleString()}</span>
              </div>

              {deck.fileUrl && (
                <Button className="w-full mt-4 gap-2" variant="secondary">
                  <Download className="h-4 w-4" /> Download Source
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}