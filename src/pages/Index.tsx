import { useAuth } from '@/hooks/useAuth';
import { MobileLayout } from '@/components/MobileLayout';
import { AuthPage } from '@/components/AuthPage';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <MobileLayout />;
};

export default Index;
