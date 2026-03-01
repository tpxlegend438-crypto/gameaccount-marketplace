import React from 'react';
import { Link } from '@tanstack/react-router';
import BottomNav from './BottomNav';
import LoginButton from './LoginButton';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto relative">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border flex items-center justify-between px-4 py-3 shadow-card">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/generated/logo-icon.dim_256x256.png"
            alt="GAME BAZAR"
            className="w-8 h-8 rounded-md object-cover"
          />
          <span className="font-heading text-xl font-bold text-neon-green tracking-wider">
            GAME BAZAR
          </span>
        </Link>
        <LoginButton />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Footer */}
      <footer className="fixed bottom-16 left-0 right-0 max-w-md mx-auto pointer-events-none">
        {/* Footer content is minimal since we have bottom nav */}
      </footer>
    </div>
  );
}
