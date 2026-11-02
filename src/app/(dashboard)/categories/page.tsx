import { CategoriesListView } from '@/features/categories/components/CategoriesListView';

export const metadata = {
  title: 'Categories — Money Manager',
  description: 'Manage income and expense categories, customize icons and colors.',
};

export default function CategoriesPage() {
  return <CategoriesListView />;
}
