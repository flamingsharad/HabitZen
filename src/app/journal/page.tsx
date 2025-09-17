
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getJournalEntry, saveJournalEntry } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function JournalPage() {
    const [reflection, setReflection] = useState('');
    const [gratitude, setGratitude] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();
    const today = new Date();

    useEffect(() => {
        const fetchEntry = async () => {
            setLoading(true);
            try {
                const entry = await getJournalEntry(today);
                if (entry) {
                    setReflection(entry.reflection);
                    setGratitude(entry.gratitude);
                }
            } catch (error) {
                console.error("Failed to fetch journal entry", error);
                toast({
                    title: 'Error',
                    description: 'Could not load your journal entry.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchEntry();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveJournalEntry(today, reflection, gratitude);
            toast({
                title: 'Journal Saved',
                description: 'Your thoughts have been recorded.',
            });
        } catch (error) {
            console.error("Failed to save journal entry", error);
            toast({
                title: 'Error',
                description: 'Could not save your journal entry.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Daily Journal</CardTitle>
                    <CardDescription>
                        Reflect on your day. Today is {format(today, 'MMMM d, yyyy')}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Today's Reflections</h3>
                                <Textarea
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder="How was your day? What went well? What could be improved?"
                                    className="min-h-[150px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Gratitude Log</h3>
                                <Textarea
                                    value={gratitude}
                                    onChange={(e) => setGratitude(e.target.value)}
                                    placeholder="What are you grateful for today? List three things."
                                    className="min-h-[100px]"
                                />
                            </div>
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Save Entry
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
