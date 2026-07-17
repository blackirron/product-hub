import { useState } from "react"
import { useListCourses } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Clock, ExternalLink, PlayCircle } from "lucide-react"

export default function Courses() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced" | "">("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setTimeout(() => setDebouncedSearch(e.target.value), 300)
  }

  const { data: courses, isLoading } = useListCourses({
    search: debouncedSearch || undefined,
    level: level || undefined,
    limit: 24
  })

  const levelColors = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">PM Courses</h1>
        <p className="text-muted-foreground text-lg">Curated educational resources to level up your product skills.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:border-primary"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button 
            variant={level === "" ? "default" : "secondary"} 
            size="sm" 
            onClick={() => setLevel("")}
          >
            All Levels
          </Button>
          <Button 
            variant={level === "beginner" ? "default" : "secondary"} 
            size="sm" 
            onClick={() => setLevel("beginner")}
          >
            Beginner
          </Button>
          <Button 
            variant={level === "intermediate" ? "default" : "secondary"} 
            size="sm" 
            onClick={() => setLevel("intermediate")}
          >
            Intermediate
          </Button>
          <Button 
            variant={level === "advanced" ? "default" : "secondary"} 
            size="sm" 
            onClick={() => setLevel("advanced")}
          >
            Advanced
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      ) : courses?.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No courses found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Card key={course.id} className="h-full flex flex-col hover-elevate transition-shadow">
              <div className="aspect-video bg-muted relative overflow-hidden rounded-t-xl border-b flex items-center justify-center">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="object-cover w-full h-full" />
                ) : (
                  <PlayCircle className="h-16 w-16 text-muted-foreground opacity-20" />
                )}
                {course.isFree && (
                  <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600 text-white border-none shadow-sm">
                    FREE
                  </Badge>
                )}
              </div>
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{course.provider}</span>
                  <Badge variant="outline" className={`border-none ${levelColors[course.level as keyof typeof levelColors]}`}>
                    {course.level}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-lg leading-tight min-h-[3rem]">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2 min-h-[2.5rem]">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex-1">
                {course.instructor && (
                  <div className="text-sm mt-2 text-muted-foreground">
                    <span className="font-medium text-foreground">Instructor:</span> {course.instructor}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-4">
                  {course.tags?.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="font-mono text-[10px] px-1.5 py-0.5">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-5 border-t bg-muted/30 flex justify-between items-center mt-auto">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" /> {course.duration || "Self-paced"}
                </div>
                <a 
                  href={course.url || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Go to course <ExternalLink className="h-4 w-4" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}