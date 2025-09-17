
'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ShareProgressCard } from './share-progress-card';
import { toPng } from 'html-to-image';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShareProgressCardModern } from './share-progress-card-modern';

type ShareProgressDialogProps = {
    progress: number;
    longestStreak: number;
    completedHabits: number;
    totalHabits: number;
}

export function ShareProgressDialog(props: ShareProgressDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("modern");
  const modernRef = useRef<HTMLDivElement>(null);
  const classicRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownload = useCallback(async () => {
    const ref = activeTab === 'modern' ? modernRef : classicRef;
    if (ref.current === null) {
      return
    }
    setIsDownloading(true);
    try {
        const filter = (node: HTMLElement) => {
            // This is a more robust way to filter out external stylesheets.
            if (node.tagName === 'LINK' && node.hasAttribute('href') && (node as HTMLLinkElement).href.indexOf('fonts.googleapis.com') !== -1) {
                return false;
            }
            return true;
        };

        const dataUrl = await toPng(ref.current, { cacheBust: true, filter });
        const link = document.createElement('a');
        link.download = `habitzen-progress-${activeTab}.png`;
        link.href = dataUrl;
        link.click();
    } catch(err) {
        console.error(err);
        toast({
            title: "Download Failed",
            description: "Could not generate the image. Please try again.",
            variant: "destructive"
        })
    } finally {
        setIsDownloading(false);
    }

  }, [activeTab, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Share2 className="mr-2 h-4 w-4"/> Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
          <DialogHeader>
              <DialogTitle>Share Your Progress</DialogTitle>
              <DialogDescription>
                Choose a template, then download the image to share.
              </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="modern">Modern</TabsTrigger>
                <TabsTrigger value="classic">Classic</TabsTrigger>
            </TabsList>
            <TabsContent value="modern" ref={modernRef}>
                <ShareProgressCardModern {...props} />
            </TabsContent>
            <TabsContent value="classic" ref={classicRef}>
                <ShareProgressCard {...props} />
            </TabsContent>
        </Tabs>
          
          <DialogFooter>
            <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Download PNG
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
