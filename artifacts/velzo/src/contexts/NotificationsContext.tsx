import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

export type NotifKind = "message" | "role" | "product" | "system";

export interface Notification {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationsCtx {
  notifications: Notification[];
  unread: number;
  add: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clear: () => void;
}

const Ctx = createContext<NotificationsCtx>({
  notifications: [],
  unread: 0,
  add: () => {},
  markAllRead: () => {},
  markRead: () => {},
  clear: () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastMessageTimestamps = useRef<Record<number, string>>({});
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const add = useCallback((n: Omit<Notification, "id" | "read" | "createdAt">) => {
    setNotifications(prev => [
      { ...n, id: `${Date.now()}-${Math.random()}`, read: false, createdAt: new Date() },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clear = useCallback(() => setNotifications([]), []);

  /* Poll conversations every 8 s to detect new messages */
  useEffect(() => {
    if (!user || !token) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch("/api/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const convs: any[] = await res.json();
        convs.forEach(conv => {
          const prev = lastMessageTimestamps.current[conv.id];
          const cur = conv.lastMessageAt;
          if (cur && prev && cur !== prev && new Date(cur) > new Date(prev)) {
            add({
              kind: "message",
              title: `New message from ${conv.otherUser.name}`,
              body: conv.lastMessage ?? "",
              href: `/messages/${conv.id}`,
            });
          }
          if (cur) lastMessageTimestamps.current[conv.id] = cur;
        });
        /* Seed on first poll so we don't flood on load */
        if (Object.keys(lastMessageTimestamps.current).length === 0) {
          convs.forEach(conv => {
            if (conv.lastMessageAt) lastMessageTimestamps.current[conv.id] = conv.lastMessageAt;
          });
        }
      } catch { /* ignore */ }
    };

    poll();
    pollRef.current = setInterval(poll, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user?.id, token, add]);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <Ctx.Provider value={{ notifications, unread, add, markAllRead, markRead, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() { return useContext(Ctx); }
