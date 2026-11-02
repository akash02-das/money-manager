import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CategorySpending } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';

interface CategoryBreakdownCardProps {
  categories: CategorySpending[];
  monthLabel?: string;
}

export function CategoryBreakdownCard({ categories, monthLabel }: CategoryBreakdownCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Expense by Category</CardTitle>
        <CardDescription>
          {monthLabel ? `Spending distribution for ${monthLabel}` : 'Spending distribution'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No expense transactions recorded for this period.
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.categoryId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate max-w-[140px] sm:max-w-[160px]">{cat.categoryName}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-foreground">
                    {formatCurrency(cat.amount, 'BDT', { hideDecimals: true })}
                  </span>
                  <span className="text-muted-foreground w-11 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
