import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/api';
import { Gamepad2, Trophy, Eye, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'PLAY', icon: Gamepad2 },
    { path: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
    { path: '/watch', label: 'WATCH', icon: Eye },
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center neon-border">
              <span className="text-2xl">🐍</span>
            </div>
            <span className="font-game text-sm neon-text hidden sm:block">
              SNAKE
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "font-game text-xs",
                    location.pathname === path && "neon-text"
                  )}
                >
                  <Icon className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-foreground">{user.username}</span>
                    <span className="text-xs text-muted-foreground">
                      High: {user.highScore}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="neon" size="sm" className="font-game text-xs">
                  LOGIN
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
