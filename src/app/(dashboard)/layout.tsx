import { AccountsProvider } from '@/features/accounts/context/AccountsContext';
import { CategoriesProvider } from '@/features/categories/context/CategoriesContext';
import { TransactionsProvider } from '@/features/transactions/context/TransactionsContext';
import { BudgetsProvider } from '@/features/budgets/context/BudgetsContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountsProvider>
      <CategoriesProvider>
        <TransactionsProvider>
          <BudgetsProvider>
            <div className="flex min-h-screen w-full bg-background">
              {/* Fixed Desktop Sidebar */}
              <Sidebar />

              {/* Main Content Area */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Sticky Header */}
                <Header />

                {/* Scrollable Page Body */}
                <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
                  <div className="mx-auto max-w-7xl">{children}</div>
                </main>
              </div>
            </div>
          </BudgetsProvider>
        </TransactionsProvider>
      </CategoriesProvider>
    </AccountsProvider>
  );
}
