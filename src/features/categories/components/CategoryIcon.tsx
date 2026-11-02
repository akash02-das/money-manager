import React from 'react';
import { Tag, LucideIcon } from 'lucide-react';
import { CATEGORY_ICONS_CATALOG } from '../schemas/category-schema';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

export function CategoryIcon({ name, className = 'size-4', color }: CategoryIconProps) {
  const match = CATEGORY_ICONS_CATALOG.find((item) => item.name === name);
  const IconComponent: LucideIcon = match ? match.icon : Tag;

  return (
    <IconComponent
      className={cn(className)}
      style={color ? { color } : undefined}
    />
  );
}
