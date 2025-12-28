import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NotificationPayload {
  id: string;
  content: string | null;
  direction: string;
  conversation_id: string;
  created_at: string;
}

export function useMessageNotifications() {
  const { user } = useAuth();
  const permissionGranted = useRef(false);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      permissionGranted.current = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionGranted.current = permission === 'granted';
      return permissionGranted.current;
    }

    return false;
  }, []);

  // Show browser notification
  const showNotification = useCallback((title: string, body: string, onClick?: () => void) => {
    if (!permissionGranted.current && Notification.permission !== 'granted') {
      // Fallback to toast
      toast(title, { description: body });
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'whatsflow-message',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        onClick?.();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      // Fallback to toast
      toast(title, { description: body });
    }
  }, []);

  // Subscribe to incoming messages
  useEffect(() => {
    if (!user) return;

    // Request permission on mount
    requestPermission();

    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const message = payload.new as NotificationPayload;
          
          // Only notify for inbound messages
          if (message.direction !== 'inbound') return;

          // Don't notify if the page is focused
          if (document.hasFocus()) {
            // Just show a toast instead
            toast('New Message', {
              description: message.content?.slice(0, 100) || 'You received a new message',
            });
            return;
          }

          // Fetch conversation details for better notification
          const { data: conversation } = await supabase
            .from('conversations')
            .select('contact_name, contact_phone')
            .eq('id', message.conversation_id)
            .single();

          const senderName = conversation?.contact_name || conversation?.contact_phone || 'Unknown';
          const messagePreview = message.content?.slice(0, 100) || 'New message received';

          showNotification(
            `New message from ${senderName}`,
            messagePreview,
            () => {
              // Navigate to messages page
              window.location.href = `/messages?conversation=${message.conversation_id}`;
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, requestPermission, showNotification]);

  return {
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  };
}
