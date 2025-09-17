
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Trash, Edit, Clock, Loader2, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getHabits, deleteHabit } from '@/lib/data';
import { Habit } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HabitForm } from '@/components/habits/habit-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export function HabitManager() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const refetchHabits = async () => {
    setLoading(true);
    const userHabits = await getHabits();
    setHabits(userHabits);
    setLoading(false);
  }

  useEffect(() => {
    refetchHabits();
  }, []);

  const confirmDelete = (id: string) => {
    setHabitToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (habitToDelete) {
      await deleteHabit(habitToDelete);
      setHabits(habits.filter(h => h.id !== habitToDelete));
      toast({ title: 'Habit deleted.', variant: 'destructive' });
      router.refresh();
      setHabitToDelete(null);
    }
    setIsAlertOpen(false);
  };

  const openAddForm = () => {
    setEditingHabit(undefined);
    setIsFormOpen(true);
  }

  const openEditForm = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  }

  const handleFormFinished = () => {
    setIsFormOpen(false);
    refetchHabits();
  }

  const getReminderText = (habit: Habit) => {
    if (!habit.reminder) return <span className="text-muted-foreground">None</span>;
    
    if (habit.reminder.type === 'specific_time') {
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{habit.reminder.value}</span>
        </div>
      );
    }
    if (habit.reminder.type === 'interval') {
       return (
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          <span>Every {habit.reminder.value.replace('h','')} hour(s)</span>
        </div>
      );
    }
    return <span className="text-muted-foreground">None</span>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openAddForm}><PlusCircle className="mr-2 h-4 w-4"/> Add Habit</Button>
      </div>
      <div className="rounded-md border">
        {loading ? (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Reminder</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {habits.map((habit) => (
                <TableRow key={habit.id}>
                    <TableCell className="font-medium">{habit.name}</TableCell>
                    <TableCell><Badge variant="secondary">{habit.category}</Badge></TableCell>
                    <TableCell className="capitalize">{habit.frequency}</TableCell>
                    <TableCell>
                        {getReminderText(habit)}
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditForm(habit)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => confirmDelete(habit.id)}>
                            <Trash className="mr-2 h-4 w-4"/> Delete
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </div>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
                <DialogDescription>
                    {editingHabit ? 'Make changes to your habit.' : 'Fill in the details for your new habit.'}
                </DialogDescription>
            </DialogHeader>
            <HabitForm habit={editingHabit} onFinished={handleFormFinished} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              habit and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
