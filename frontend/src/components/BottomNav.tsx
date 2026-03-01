import { Link, useRouterState } from '@tanstack/react-router';
import { Home, PlusSquare, User, ShoppingCart, MessageCircle, Loader2 } from 'lucide-react';
import { useIsAdmin } from '../hooks/useIsAdmin';

const browseItem = { to: '/', icon: Home, label: 'Browse' };
const chatsItem = { to: '/chats', icon: MessageCircle, label: 'Chats' };
const cartItem = { to: '/my-listings', icon: ShoppingCart, label: 'Cart' };
const profileItem = { to: '/profile', icon: User, label: 'Profile' };
const sellNavItem = { to: '/create', icon: PlusSquare, label: 'Sell' };

export default function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isAdmin, isLoading } = useIsAdmin();

  const navItems = isAdmin
    ? [browseItem, chatsItem, sellNavItem, cartItem, profileItem]
    : [browseItem, chatsItem, cartItem, profileItem];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? currentPath === '/' : currentPath.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive
                  ? 'text-neon-green'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isLoading && label === 'Sell' ? (
                <Loader2 size={22} className="animate-spin text-muted-foreground" />
              ) : (
                <Icon
                  size={22}
                  className={isActive ? 'drop-shadow-[0_0_6px_oklch(0.82_0.22_142)]' : ''}
                />
              )}
              <span className={`text-[10px] font-medium font-body ${isActive ? 'text-neon-green' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
