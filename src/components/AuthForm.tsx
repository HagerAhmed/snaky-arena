import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignup: (username: string, email: string, password: string) => Promise<boolean>;
  error: string | null;
  loading: boolean;
  onClearError: () => void;
}

export const AuthForm = ({
  onLogin,
  onSignup,
  error,
  loading,
  onClearError,
}: AuthFormProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'login') {
      await onLogin(email, password);
    } else {
      await onSignup(username, email, password);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    onClearError();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border border-border rounded-lg p-8 neon-border">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-4xl">🐍</span>
          </div>
          <h1 className="text-2xl font-game neon-text mb-2">
            {mode === 'login' ? 'WELCOME BACK' : 'JOIN THE GAME'}
          </h1>
          <p className="text-sm text-muted-foreground font-display">
            {mode === 'login' 
              ? 'Login to track your scores' 
              : 'Create an account to compete'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-game">
                USERNAME
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="SnakeMaster"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-game">
              EMAIL
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="player@snake.game"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-game">
              PASSWORD
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/50 text-destructive text-sm font-display">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="arcade" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              'LOGIN'
            ) : (
              'SIGN UP'
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:text-primary font-display transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Login'}
          </button>
        </div>

        {/* Demo credentials */}
        {mode === 'login' && (
          <div className="mt-6 p-3 rounded-md bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground font-display mb-2">
              Demo credentials:
            </p>
            <p className="text-xs font-display text-foreground">
              Email: snake@game.com<br />
              Password: password123
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
