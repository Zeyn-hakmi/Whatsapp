import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationContextValue {
  isEnabled: boolean;
  permission: NotificationPermission | 'denied';
  requestPermission: () => Promise<boolean>;
  isSupported: boolean;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const { requestPermission, isSupported, permission } = useMessageNotifications();
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    if (isSupported && permission === 'granted') {
      setIsEnabled(true);
    }
  }, [isSupported, permission]);

  // Prompt user to enable notifications after login
  useEffect(() => {
    if (!user || hasPrompted || !isSupported) return;
    if (permission === 'granted' || permission === 'denied') return;

    const timer = setTimeout(() => {
      setHasPrompted(true);
      toast(
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Enable Notifications?</p>
            <p className="text-sm text-muted-foreground">
              Get notified when you receive new messages
            </p>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              const granted = await requestPermission();
              setIsEnabled(granted);
              if (granted) {
                toast.success('Notifications enabled!');
              }
            }}
          >
            Enable
          </Button>
        </div>,
        {
          duration: 10000,
        }
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, hasPrompted, isSupported, permission, requestPermission]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setIsEnabled(granted);
    return granted;
  };

  return (
    <NotificationContext.Provider
      value={{
        isEnabled,
        permission,
        requestPermission: handleRequestPermission,
        isSupported,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Notification toggle button for header/settings
export function NotificationToggle() {
  const { isEnabled, isSupported, permission, requestPermission } = useNotifications();

  if (!isSupported) return null;

  const handleClick = async () => {
    if (permission === 'denied') {
      toast.error('Notifications blocked. Please enable in browser settings.');
      return;
    }
    
    if (!isEnabled) {
      const granted = await requestPermission();
      if (granted) {
        toast.success('Notifications enabled!');
      }
    } else {
      toast.info('To disable, update your browser notification settings.');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      className={isEnabled ? 'text-primary' : 'text-muted-foreground'}
      title={isEnabled ? 'Notifications enabled' : 'Enable notifications'}
    >
      {isEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
    </Button>
  );
}
