'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Category } from '@/types/finance';

interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onConfirmDelete: () => Promise<void>;
  onArchiveInstead?: () => Promise<void>;
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  onConfirmDelete,
  onArchiveInstead,
}: CategoryDeleteDialogProps) {
  if (!category) return null;

  const isDefault = category.isDefault;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDefault
              ? `Cannot Delete Default Category "${category.name}"`
              : `Delete Category "${category.name}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-left">
            {isDefault ? (
              <span>
                Default system categories cannot be permanently deleted because
                they are referenced by system templates and reports. However, you
                can <strong>Archive</strong> this category to hide it from selection
                menus.
              </span>
            ) : (
              <span>
                Are you sure you want to permanently delete this category? Any
                historical transactions using this category will lose their category tag.
              </span>
            )}
            <span className="block text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/60">
              💡 <strong>Recommendation:</strong> Archiving a category is safer than
              deleting because it preserves your past transaction and budget reporting.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-1.5">
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          {onArchiveInstead && !category.isArchived && (
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={async () => {
                await onArchiveInstead();
                onOpenChange(false);
              }}
            >
              Archive Category
            </AlertDialogAction>
          )}

          {!isDefault && (
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={async () => {
                await onConfirmDelete();
                onOpenChange(false);
              }}
            >
              Delete Permanently
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
