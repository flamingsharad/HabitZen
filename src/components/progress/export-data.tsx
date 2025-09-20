
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, File, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getHabits, getAllMoods, getAllJournalEntries } from '@/lib/data';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

export function ExportData() {
  const [loading, setLoading] = useState<'pdf' | 'excel' | false>(false);
  const { toast } = useToast();
  const { userData } = useAuth();

  const handleExport = async (formatType: 'pdf' | 'excel') => {
    setLoading(formatType);
    try {
      const [habits, moods, journalEntries] = await Promise.all([
        getHabits(),
        getAllMoods(),
        getAllJournalEntries(),
      ]);

      if (formatType === 'excel') {
        // Create habits sheet
        const habitLogsData = habits.flatMap(h => 
            h.logs.map(l => ({
                habit_name: h.name,
                habit_category: h.category,
                log_date: l.date,
                log_status: l.status,
            }))
        );
        const habitsSheet = XLSX.utils.json_to_sheet(habitLogsData);

        // Create moods sheet
        const moodsData = moods.map(m => ({
            date: m.date,
            mood: m.mood,
            notes: m.notes,
        }));
        const moodsSheet = XLSX.utils.json_to_sheet(moodsData);

        // Create journal sheet
        const journalData = journalEntries.map(j => ({
            date: j.date,
            reflection: j.reflection,
            gratitude: j.gratitude,
        }));
        const journalSheet = XLSX.utils.json_to_sheet(journalData);
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, habitsSheet, 'Habits & Logs');
        XLSX.utils.book_append_sheet(wb, moodsSheet, 'Moods');
        XLSX.utils.book_append_sheet(wb, journalSheet, 'Journal');

        XLSX.writeFile(wb, `HabitZen_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

      } else if (formatType === 'pdf') {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;

        // --- Title Page ---
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.text('HabitZen', pageWidth / 2, pageHeight / 3, { align: 'center' });
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'normal');
        doc.text('Your Personal Data Export', pageWidth / 2, pageHeight / 3 + 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`For: ${userData?.name || 'User'}`, pageWidth / 2, pageHeight / 3 + 30, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Export Date: ${format(new Date(), 'yyyy-MM-dd')}`, pageWidth / 2, pageHeight / 3 + 36, { align: 'center' });


        const addPageHeader = (title: string) => {
            doc.addPage();
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 14, 22);
        };
        
        // --- Habits Summary ---
        addPageHeader('Habits Summary');
        autoTable(doc, {
            head: [['Habit Name', 'Category', 'Current Streak']],
            body: habits.map(h => [h.name, h.category, h.streak]),
            startY: 30,
            headStyles: { fillColor: [107, 70, 193] }, // Primary color
        });

        // --- All Habit Logs ---
        addPageHeader('All Habit Logs');
        autoTable(doc, {
            head: [['Habit', 'Date', 'Status']],
            body: habits.flatMap(h => h.logs.map(l => [h.name, l.date, l.status])),
            startY: 30,
            headStyles: { fillColor: [107, 70, 193] },
        });

        // --- Mood Logs ---
        addPageHeader('Mood Logs');
        autoTable(doc, {
            head: [['Date', 'Mood (1-5)', 'Notes']],
            body: moods.map(m => [m.date, m.mood, m.notes || '']),
            startY: 30,
            headStyles: { fillColor: [107, 70, 193] },
        });
        
        // --- Journal Entries ---
        addPageHeader('Journal Entries');
        autoTable(doc, {
            head: [['Date', 'Reflection', 'Gratitude']],
            body: journalEntries.map(j => [j.date, j.reflection, j.gratitude]),
            startY: 30,
            headStyles: { fillColor: [107, 70, 193] },
        });

        // --- Add Page Numbers ---
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10);
        }
        
        doc.save(`HabitZen_Export_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      }

      toast({
        title: 'Export Successful',
        description: `Your data has been downloaded as a ${formatType.toUpperCase()} file.`,
      });
    } catch (error) {
      console.error('Failed to export data', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Your Data</CardTitle>
        <CardDescription>
          Download a complete history of your habits, moods, and journal entries in PDF or Excel format.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-wrap gap-4">
        <Button onClick={() => handleExport('pdf')} disabled={loading !== false}>
          {loading === 'pdf' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          Export as PDF
        </Button>
        <Button onClick={() => handleExport('excel')} variant="secondary" disabled={loading !== false}>
          {loading === 'excel' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <File className="mr-2 h-4 w-4" />
          )}
          Export as Excel
        </Button>
      </CardFooter>
    </Card>
  );
}
