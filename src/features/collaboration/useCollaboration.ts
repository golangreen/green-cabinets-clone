/**
 * Real-time Collaboration Hook
 * Phase 36b Implementation
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export interface CollaborationUser {
  userId: string;
  email: string;
  cursorPosition?: { x: number; y: number };
  selectedElement?: string;
  color: string;
}

export interface DesignSession {
  id: string;
  ownerId: string;
  sessionName: string;
  config: any;
  createdAt: string;
  expiresAt?: string;
}

export const useCollaboration = (sessionId: string) => {
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const presenceChannel = supabase.channel(`design-session:${sessionId}`, {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = (Object.values(state).flat() as unknown as CollaborationUser[])
          .filter((p) => p.userId);
        setActiveUsers(users);
        logger.debug('Presence sync', { userCount: users.length });
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        logger.info('User joined', { count: newPresences.length });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        logger.info('User left', { count: leftPresences.length });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          logger.info('Collaboration channel subscribed');
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [sessionId]);

  const trackPresence = async (user: Partial<CollaborationUser>) => {
    if (!channel) return;

    const userColors = [
      '#2dd4bf', // teal
      '#D4AF37', // gold
      '#3b82f6', // blue
      '#ef4444', // red
      '#22c55e', // green
      '#a855f7', // purple
    ];

    const color = userColors[Math.floor(Math.random() * userColors.length)];

    await channel.track({
      ...user,
      color,
      online_at: new Date().toISOString(),
    });
  };

  const updateCursor = async (x: number, y: number) => {
    if (!channel) return;
    await channel.track({
      cursorPosition: { x, y },
    });
  };

  const broadcastConfigChange = async (config: any) => {
    if (!channel) return;
    await channel.send({
      type: 'broadcast',
      event: 'config-update',
      payload: { config },
    });
  };

  return {
    activeUsers,
    isConnected,
    trackPresence,
    updateCursor,
    broadcastConfigChange,
  };
};
