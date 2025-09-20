import { Logo } from "@/components/icons/logo";

export function PageLoader() {
  return (
    <div className="relative flex h-64 w-full items-center justify-center overflow-hidden bg-transparent">
      <div className="z-10 flex flex-col items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75"></div>
          <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-background p-3 shadow-inner">
             <Logo className="h-10 w-10 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
