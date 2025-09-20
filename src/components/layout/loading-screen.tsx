import { Logo } from "@/components/icons/logo";

export function LoadingScreen() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 animate-gradient-xy" />
      <div className="z-10 flex flex-col items-center gap-4">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75"></div>
          <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-background p-4 shadow-inner">
             <Logo className="h-12 w-12 text-primary" />
          </div>
        </div>
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
            Loading HabitZen...
        </p>
      </div>
    </div>
  );
}
