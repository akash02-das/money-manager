'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Clock,
  Coins,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MotivationalQuote {
  quote: string;
  author: string;
  category?: 'time' | 'saving' | 'wealth' | 'investing' | 'discipline';
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  // 1-12: Time as Wealth & Compounding
  { quote: 'Time is money — invest it where the returns are highest.', author: 'Benjamin Franklin', category: 'time' },
  { quote: 'Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn\'t, pays it.', author: 'Albert Einstein', category: 'investing' },
  { quote: 'The big money is not in the buying and the selling, but in the waiting.', author: 'Charlie Munger', category: 'investing' },
  { quote: 'Time in the market beats timing the market every single time.', author: 'Financial Adage', category: 'investing' },
  { quote: 'Tick by tick, second by second, discipline builds an enduring financial empire.', author: 'Money Manager', category: 'time' },
  { quote: 'Every hour spent building financial discipline buys you ten hours of future freedom.', author: 'Wealth Principle', category: 'time' },
  { quote: 'Lost time is never found again, and lost capital is rarely compounded.', author: 'Benjamin Franklin', category: 'time' },
  { quote: 'Your wealth is a function of time and patience multiplied by consistency.', author: 'Morgan Housel', category: 'wealth' },
  { quote: 'Rich people invest in time; poor people invest in money.', author: 'Warren Buffett', category: 'wealth' },
  { quote: 'If you don\'t find a way to make money while you sleep, you will work until you die.', author: 'Warren Buffett', category: 'investing' },
  { quote: 'Earn with your mind, not your time; leverage capital and compounding.', author: 'Naval Ravikant', category: 'wealth' },
  { quote: 'Patience is the greatest arbitrage in wealth accumulation.', author: 'Disciplined Investor', category: 'time' },

  // 13-26: Savings, Frugality & Living Below Means
  { quote: 'Do not save what is left after spending, but spend what is left after saving.', author: 'Warren Buffett', category: 'saving' },
  { quote: 'A penny saved is a penny earned — and invested, it becomes a fortune.', author: 'Classic Proverb', category: 'saving' },
  { quote: 'Beware of little expenses; a small leak will sink a great ship.', author: 'Benjamin Franklin', category: 'saving' },
  { quote: 'Wealth consists not in having great possessions, but in having few wants.', author: 'Epictetus', category: 'wealth' },
  { quote: 'Financial peace isn\'t the acquisition of stuff. It\'s learning to live on less than you make.', author: 'Dave Ramsey', category: 'saving' },
  { quote: 'Spending money to show people how much money you have is the fastest way to have less money.', author: 'Morgan Housel', category: 'saving' },
  { quote: 'The art is not in making money, but in keeping it.', author: 'Proverb', category: 'saving' },
  { quote: 'Saving is the gap between your ego and your income.', author: 'Morgan Housel', category: 'saving' },
  { quote: 'Every taka saved today is an employee working around the clock for your future self.', author: 'Money Manager', category: 'saving' },
  { quote: 'Frugality without deprivation is the foundation of true financial independence.', author: 'Financial Wisdom', category: 'saving' },
  { quote: 'Never spend your money before you have earned it.', author: 'Thomas Jefferson', category: 'discipline' },
  { quote: 'It\'s not your salary that makes you rich, it\'s your spending habits.', author: 'Charles A. Jaffe', category: 'saving' },
  { quote: 'Too many people spend money they haven\'t earned, to buy things they don\'t want, to impress people they don\'t like.', author: 'Will Rogers', category: 'saving' },
  { quote: 'Small daily savings create exponential fortunes over decades.', author: 'Compounding Truth', category: 'saving' },

  // 27-40: Wealth, Freedom & Mindset
  { quote: 'True wealth is the ability to fully experience life on your own terms.', author: 'Henry David Thoreau', category: 'wealth' },
  { quote: 'Financial freedom is available to those who learn about it and work for it.', author: 'Robert Kiyosaki', category: 'wealth' },
  { quote: 'Money is a terrible master but an excellent servant.', author: 'P.T. Barnum', category: 'wealth' },
  { quote: 'Wealth is what you don\'t see: the assets saved and invested rather than consumed.', author: 'Morgan Housel', category: 'wealth' },
  { quote: 'The goal isn\'t more money. The goal is living life on your own schedule.', author: 'Chris Brogan', category: 'wealth' },
  { quote: 'Wealth is the slave of a wise man, and the master of a fool.', author: 'Seneca', category: 'wealth' },
  { quote: 'If you buy things you do not need, soon you will have to sell things you need.', author: 'Warren Buffett', category: 'discipline' },
  { quote: 'Freedom is the only real wealth; owning your calendar is the ultimate luxury.', author: 'Naval Ravikant', category: 'wealth' },
  { quote: 'Being rich is having money; being wealthy is having time.', author: 'Financial Maxim', category: 'wealth' },
  { quote: 'Financial independence is not about being rich; it\'s about owning your time.', author: 'Vicki Robin', category: 'wealth' },
  { quote: 'Peace of mind is the greatest dividend your investments will ever pay.', author: 'Morgan Housel', category: 'wealth' },
  { quote: 'Wealth is built in silence through quiet, deliberate daily decisions.', author: 'Disciplined Investor', category: 'discipline' },
  { quote: 'Money looks better in investments than on your feet or in your closet.', author: 'Financial Realism', category: 'saving' },
  { quote: 'Wealth isn\'t about having a lot of money; it\'s about having a lot of options.', author: 'Chris Rock', category: 'wealth' },

  // 41-52: Investing, Patience & Knowledge
  { quote: 'The stock market is a device for transferring money from the impatient to the patient.', author: 'Warren Buffett', category: 'investing' },
  { quote: 'Know what you own, and know why you own it.', author: 'Peter Lynch', category: 'investing' },
  { quote: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin', category: 'investing' },
  { quote: 'The four most dangerous words in investing are: \'This time it\'s different.\'', author: 'Sir John Templeton', category: 'investing' },
  { quote: 'Risk comes from not knowing what you\'re doing. Knowledge reduces risk.', author: 'Warren Buffett', category: 'investing' },
  { quote: 'Consistency is vastly more important than brilliance when building wealth.', author: 'Jack Bogle', category: 'investing' },
  { quote: 'Great investing requires a high tolerance for boredom and an appetite for patience.', author: 'Charlie Munger', category: 'investing' },
  { quote: 'Plant the seed today so your family can sit in the shade of wealth tomorrow.', author: 'Ancient Proverb', category: 'investing' },
  { quote: 'Never depend on a single income. Invest to create multiple streams of value.', author: 'Warren Buffett', category: 'investing' },
  { quote: 'The secret to wealth is simple: live below your means, invest the difference, and wait.', author: 'Jack Bogle', category: 'investing' },
  { quote: 'Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.', author: 'Warren Buffett', category: 'discipline' },
  { quote: 'Buy assets, not liabilities dressed up as assets.', author: 'Robert Kiyosaki', category: 'investing' },

  // 53-62: Budgeting, Cash Flow & Discipline
  { quote: 'A budget is telling your money where to go instead of wondering where it went.', author: 'John C. Maxwell', category: 'discipline' },
  { quote: 'Control your cash flow before debt and impulsive spending control you.', author: 'Money Manager', category: 'discipline' },
  { quote: 'Track every taka: precision today creates prosperity tomorrow.', author: 'Ledger Rule', category: 'discipline' },
  { quote: 'Financial discipline is simply choosing between what you want now and what you want most.', author: 'Abraham Lincoln', category: 'discipline' },
  { quote: 'Every transaction is a vote for the financial future you are building.', author: 'Modern Wealth', category: 'discipline' },
  { quote: 'Money grows on the tree of persistence and disciplined bookkeeping.', author: 'Proverb', category: 'discipline' },
  { quote: 'You don\'t need a fortune to start, but you must start to make a fortune.', author: 'Financial Truth', category: 'discipline' },
  { quote: 'Debt is a thief of tomorrow\'s earnings; live debt-free and breathe easily.', author: 'Dave Ramsey', category: 'saving' },
  { quote: 'Success with money is 20% head knowledge and 80% behavior.', author: 'Dave Ramsey', category: 'discipline' },
  { quote: 'The best time to start managing your finances was yesterday. The next best time is right now.', author: 'Action Rule', category: 'time' },
];

export function TimeIsMoneyTicker() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isSparkling, setIsSparkling] = useState(false);

  // Advance clock every second
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cycle motivational quote automatically every 14 seconds
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 14000);

    return () => clearInterval(quoteTimer);
  }, []);

  const handleNextQuote = useCallback(() => {
    setIsSparkling(true);
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    setTimeout(() => setIsSparkling(false), 400);
  }, []);

  const handlePrevQuote = useCallback(() => {
    setIsSparkling(true);
    setQuoteIndex((prev) => (prev - 1 + MOTIVATIONAL_QUOTES.length) % MOTIVATIONAL_QUOTES.length);
    setTimeout(() => setIsSparkling(false), 400);
  }, []);

  const handleRandomQuote = useCallback(() => {
    setIsSparkling(true);
    setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
    setTimeout(() => setIsSparkling(false), 400);
  }, []);

  const timeFormatted = useMemo(() => {
    if (!mounted) return '--:--:-- --';
    try {
      return format(currentTime, 'hh:mm:ss a');
    } catch {
      return '--:--:-- --';
    }
  }, [currentTime, mounted]);

  const dateFormatted = useMemo(() => {
    if (!mounted) return 'Loading date...';
    try {
      return format(currentTime, 'EEEE, MMM d, yyyy');
    } catch {
      return 'Loading date...';
    }
  }, [currentTime, mounted]);

  const currentItem = MOTIVATIONAL_QUOTES[quoteIndex] || MOTIVATIONAL_QUOTES[0];

  return (
    <div
      className={cn(
        'w-full border-t border-border/50 bg-gradient-to-r from-amber-500/5 via-background to-emerald-500/5',
        'px-4 md:px-8 py-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-xs',
        'transition-colors select-none'
      )}
    >
      {/* Left Column: Real-Time Precision Clock & Calendar */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Pulsing Live Beacon */}
        <div className="flex items-center gap-1.5" title="Real-time financial clock active">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
            LIVE
          </span>
        </div>

        <div className="h-3.5 w-px bg-border/70" />

        {/* Digital Clock */}
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-amber-500 shrink-0" />
          <span className="font-mono text-xs font-bold text-foreground tabular-nums tracking-tight">
            {timeFormatted}
          </span>
        </div>

        <span className="text-muted-foreground/60 hidden sm:inline">•</span>

        {/* Full Date */}
        <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
          {dateFormatted}
        </span>
      </div>

      {/* Right Column: Time is Money Pill & 50+ Motivational Quotes */}
      <div className="flex items-center gap-2.5 flex-1 justify-end min-w-0">
        {/* "Time is Money" Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[10px] font-bold shrink-0 shadow-2xs">
          <Coins
            className={cn(
              'size-3 text-amber-500 transition-transform duration-300',
              isSparkling && 'rotate-45 scale-125'
            )}
          />
          <span>Time is Money</span>
          <Sparkles
            className={cn(
              'size-2.5 text-amber-500 transition-transform duration-300',
              isSparkling && 'rotate-180 scale-125'
            )}
          />
        </div>

        {/* Motivational Quote Text */}
        <div
          onClick={handleNextQuote}
          title="Click to cycle next motivational wealth quote"
          className="flex items-center gap-1.5 min-w-0 cursor-pointer group"
        >
          <p className="text-[11px] text-foreground/90 italic font-medium truncate max-w-[260px] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl group-hover:text-foreground transition-colors">
            &ldquo;{currentItem.quote}&rdquo;
            {currentItem.author && (
              <span className="text-muted-foreground not-italic font-normal ml-1.5 text-[10px]">
                — {currentItem.author}
              </span>
            )}
          </p>
        </div>

        {/* Quote Navigation Controls */}
        <div className="flex items-center gap-0.5 shrink-0 bg-muted/60 p-0.5 rounded-md border border-border/60">
          <span className="text-[9px] text-muted-foreground font-mono px-1.5 select-none" title="Current quote number">
            {quoteIndex + 1}/{MOTIVATIONAL_QUOTES.length}
          </span>

          <button
            type="button"
            onClick={handlePrevQuote}
            className="p-1 rounded hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Previous motivational quote"
          >
            <ChevronLeft className="size-3" />
          </button>

          <button
            type="button"
            onClick={handleNextQuote}
            className="p-1 rounded hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Next motivational quote"
          >
            <ChevronRight className="size-3" />
          </button>

          <button
            type="button"
            onClick={handleRandomQuote}
            className="p-1 rounded hover:bg-background/80 text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
            title="Random quote shuffle"
          >
            <Shuffle className="size-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
