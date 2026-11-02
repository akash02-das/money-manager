'use client';

import React from 'react';
import {
  MoreVertical,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
  Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryIcon } from './CategoryIcon';
import type { Category } from '@/types/finance';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onToggleArchive: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryCard({
  category,
  onEdit,
  onToggleArchive,
  onDelete,
}: CategoryCardProps) {
  const isIncome = category.type === 'INCOME';

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200 hover:shadow-md border border-border/70',
        category.isArchived && 'opacity-65 bg-muted/20 border-dashed'
      )}
    >
      {/* Top Color Accent Ribbon */}
      <div
        className="h-1.5 w-full transition-all group-hover:h-2"
        style={{ backgroundColor: category.color || '#10b981' }}
      />

      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Icon & Category Name */}
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
              style={{ backgroundColor: category.color || '#10b981' }}
            >
              <CategoryIcon name={category.icon} className="size-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground truncate max-w-[150px] sm:max-w-[180px]">
                  {category.name}
                </h3>
                {category.isArchived && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-muted">
                    Archived
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] px-1.5 py-0 h-4 font-normal',
                    isIncome
                      ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                      : 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5'
                  )}
                >
                  {isIncome ? 'Income' : 'Expense'}
                </Badge>

                {category.isDefault ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground gap-1"
                  >
                    <Lock className="size-2.5" /> Default
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 font-normal text-primary border-primary/20 bg-primary/5"
                  >
                    Custom
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Category options</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onEdit(category)}
              >
                <Edit2 className="size-3.5 text-muted-foreground" />
                <span>Edit Category</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onToggleArchive(category)}
              >
                {category.isArchived ? (
                  <>
                    <ArchiveRestore className="size-3.5 text-emerald-500" />
                    <span>Unarchive</span>
                  </>
                ) : (
                  <>
                    <Archive className="size-3.5 text-amber-500" />
                    <span>Archive</span>
                  </>
                )}
              </DropdownMenuItem>

              {!category.isDefault && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
