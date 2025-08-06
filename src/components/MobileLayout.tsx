import { useState } from 'react';
import { Timer, Target, User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TimerPanel } from './TimerPanel';
import { HabitsPanel } from './HabitsPanel';
import { ProfilePanel } from './ProfilePanel';

type ActivePanel = 'timer' | 'habits' | 'profile';

export const MobileLayout = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>('timer');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const panels = [
    { id: 'timer' as const, label: 'Timer', icon: Timer, component: TimerPanel },
    { id: 'habits' as const, label: 'Habits', icon: Target, component: HabitsPanel },
    { id: 'profile' as const, label: 'Profile', icon: User, component: ProfilePanel },
  ];

  const ActiveComponent = panels.find(p => p.id === activePanel)?.component || TimerPanel;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold">HABIT TRACKER</h1>
            {user && (
              <p className="text-sm text-muted-foreground">
                Welcome, {user.user_metadata?.display_name || user.email?.split('@')[0]}
              </p>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {panels.map(panel => {
              const Icon = panel.icon;
              return (
                <Button
                  key={panel.id}
                  variant={activePanel === panel.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActivePanel(panel.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {panel.label}
                </Button>
              );
            })}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-2 mt-8">
                {panels.map(panel => {
                  const Icon = panel.icon;
                  return (
                    <Button
                      key={panel.id}
                      variant={activePanel === panel.id ? "default" : "ghost"}
                      onClick={() => {
                        setActivePanel(panel.id);
                        setIsMenuOpen(false);
                      }}
                      className="justify-start gap-3"
                    >
                      <Icon className="w-5 h-5" />
                      {panel.label}
                    </Button>
                  );
                })}
                <div className="border-t border-border mt-4 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="justify-start gap-3 text-destructive hover:text-destructive"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <ActiveComponent />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-around p-2">
          {panels.map(panel => {
            const Icon = panel.icon;
            const isActive = activePanel === panel.id;
            return (
              <Button
                key={panel.id}
                variant="ghost"
                size="sm"
                onClick={() => setActivePanel(panel.id)}
                className={`flex-1 flex-col gap-1 h-16 ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{panel.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};