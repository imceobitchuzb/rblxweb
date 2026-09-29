"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  X,
  ExternalLink,
} from "lucide-react";
import { NotificationItem } from "@/lib/notification-utils";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationCenterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: NotificationItem) => {
    onMarkAsRead(item.id);
    setIsOpen(false);
    router.push(item.href);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-8 h-8 rounded-xl bg-surface-panel/80 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-violet-500"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel bg-surface-panel/95 border border-white/10 shadow-2xl p-4 z-50 space-y-3 animate-in zoom-in-95 duration-150 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-violet-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Notifications ({unreadCount})
              </h4>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                No notifications right now.
              </p>
            ) : (
              notifications.map((item) => {
                const typeIcon = {
                  warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
                  action: <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
                  success: <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
                  info: <Info className="w-3.5 h-3.5 text-violet-400 shrink-0" />,
                }[item.type];

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer space-y-1 relative group",
                      item.isRead
                        ? "bg-surface-canvas/40 border-white/5 opacity-70 hover:opacity-100"
                        : "bg-surface-canvas/90 border-white/10 hover:border-violet-500/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {typeIcon}
                        <h6 className="text-xs font-bold text-white truncate">
                          {item.title}
                        </h6>
                      </div>

                      {!item.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 animate-pulse" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 pl-5.5">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1">
                      <span>{item.timestamp}</span>
                      <span className="text-cyan-400 group-hover:underline flex items-center gap-0.5">
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
