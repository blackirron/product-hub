import { useState } from "react"
import { useLocation } from "wouter"
import { useCreateDeck } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Link as LinkIcon, FileImage } from "lucide-react"

export default function UploadDeck() {
  const [, setLocation] = useLocation()
  const [tagInput, setTagInput] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    thumbnailUrl: "",
    tags: [] as string[]
  })

  const createMutation = useCreateDeck({
    mutation: {
      onSuccess: (data) => {
        setLocation(`/decks/${data.id}`)
      }
    }
  })

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim().toLowerCase()]
        }))
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Hardcoded userId 1 for demo purposes
    createMutation.mutate({
      data: {
        userId: 1,
        title: formData.title,
        description: formData.description,
        fileUrl: formData.fileUrl,
        thumbnailUrl: formData.thumbnailUrl,
        tags: formData.tags
      }
    })
  }

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Deck</h1>
        <p className="text-muted-foreground text-lg">Share your knowledge with the PM community.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Deck Details</CardTitle>
            <CardDescription>Provide clear information so others can discover your work.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input 
                id="title" 
                placeholder="e.g. Product Strategy Q3 2024" 
                required
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="What is this deck about? Who is it for?"
                rows={4}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileUrl">Presentation URL (Google Slides, Figma, Pitch, etc.)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="fileUrl" 
                  placeholder="https://..." 
                  className="pl-9"
                  value={formData.fileUrl}
                  onChange={e => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Make sure the link is set to "Anyone with the link can view"</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail Image URL</Label>
              <div className="relative">
                <FileImage className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="thumbnailUrl" 
                  placeholder="https://..." 
                  className="pl-9"
                  value={formData.thumbnailUrl}
                  onChange={e => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="p-3 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 flex items-center pr-1">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      className="hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  id="tags"
                  type="text"
                  placeholder={formData.tags.length === 0 ? "Type and press enter to add tags (e.g. strategy, tear-down)..." : "Add tag..."}
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 border-t flex justify-end gap-4 p-6">
            <Button variant="ghost" type="button" onClick={() => window.history.back()}>Cancel</Button>
            <Button type="submit" disabled={!formData.title || createMutation.isPending} className="gap-2">
              {createMutation.isPending ? (
                "Publishing..."
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Publish Deck
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}