import Link from 'next/link';
import { ArrowLeft, Clock, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  plannedFeatures: string[];
}

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  plannedFeatures,
}: ModulePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 max-w-2xl mx-auto">
      <Card className="w-full text-center">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Icon className="size-7" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <Badge variant="outline" className="gap-1 text-xs font-normal">
              <Clock className="size-3 text-amber-500" /> Planned MVP Phase
            </Badge>
          </div>
          <CardDescription className="text-sm max-w-md">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 text-left">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Features Scheduled for Implementation:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground">
              {plannedFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center pt-2">
            <Button variant="outline" size="sm" render={<Link href="/" />}>
              <ArrowLeft className="size-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
