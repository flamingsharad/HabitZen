
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function AchievementsSkeleton() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="flex flex-col items-center justify-center p-6 text-center bg-muted/50">
                            <Skeleton className="h-10 w-10 rounded-full mb-4" />
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
