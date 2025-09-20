
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Milestone } from "lucide-react"

export function ProgressSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-16" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-16" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-36" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <div className="flex justify-end gap-2">
                    {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-4 w-16" />)}
                </div>
                <div className="flex gap-2">
                    <div className="w-10 space-y-2">
                        <Skeleton className="h-8" />
                        <Skeleton className="h-8" />
                        <Skeleton className="h-8" />
                    </div>
                    <div className="grid grid-cols-31 flex-1 gap-2">
                        {Array.from({ length: 31 * 3 }).map((_, i) => (
                           <Skeleton key={i} className="h-8 w-full rounded-md" />
                        ))}
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
       <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Card className="flex-1 min-w-[300px] w-full max-w-full lg:max-w-lg">
                <CardHeader>
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-52 w-full" />
                </CardContent>
            </Card>
            <Card className="flex-1 min-w-[300px] w-full max-w-full lg:max-w-lg">
                <CardHeader>
                     <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                     <Skeleton className="h-52 w-full" />
                </CardContent>
            </Card>
        </div>
        <Card>
             <CardHeader>
                <Skeleton className="h-7 w-52" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-8">
                 {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-5 w-48" />
                           <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                 ))}
            </CardContent>
        </Card>
    </div>
  )
}
