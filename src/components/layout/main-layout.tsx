'use client';

import { Header } from './header';
import { Sidebar } from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

// Demo user - in real app this comes from auth context
const defaultUser = {
  name: 'Test User',
  email: 'test@learnflow.ai',
  avatarUrl: undefined,
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header user={defaultUser} xp={0} streak={0} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
