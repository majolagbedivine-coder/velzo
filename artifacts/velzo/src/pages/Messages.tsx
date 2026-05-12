import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import {
  useListConversations,
  useListMessages,
  useSendMessage,
} from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import {
  Send, MessageSquare, Loader2, ArrowLeft, Search,
  Smile, Paperclip, Circle, CheckCheck, X
} from "lucide-react";
import { Link } from "wouter";

const GREEN = "#0D3B27";
const GREEN_LIGHT = "#e6f0ea";

const EMOJIS = ["👍", "❤️", "😂", "🙏", "🔥", "✅", "👀", "🎉", "💯", "😊", "🚀", "💡"];

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDateLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = today.getTime() - msgDay.getTime();
  if (diff === 0) return "Today";
  if (diff === 86400000) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtConvTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000) || 1}m`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Messages() {
  const { id } = useParams<{ id?: string }>();
  const conversationId = id ? Number(id) : null;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [attachUrl, setAttachUrl] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversations = [], isLoading: convLoading } = useListConversations({
    query: { queryKey: ["/api/conversations"], refetchInterval: 6000 },
  });
  const { data: messages = [], isLoading: msgLoading } = useListMessages(
    conversationId ?? 0,
    {
      query: {
        enabled: !!conversationId,
        queryKey: [`/api/conversations/${conversationId}/messages`],
        refetchInterval: 4000,
      },
    }
  );
  const sendMessage = useSendMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const activeConv = conversations.find((c) => c.id === conversationId);

  const filteredConvs = conversations.filter(c =>
    c.otherUser.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.lastMessage ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = attachUrl.trim()
      ? `${content.trim()}${content.trim() ? "\n" : ""}📎 ${attachUrl.trim()}`
      : content.trim();
    if (!text || !conversationId) return;
    setSending(true);
    try {
      await sendMessage.mutateAsync({ conversationId, data: { content: text } });
      setContent("");
      setAttachUrl("");
      setShowAttach(false);
      setShowEmoji(false);
      qc.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
      qc.invalidateQueries({ queryKey: ["/api/conversations"] });
    } finally {
      setSending(false);
    }
  }, [content, attachUrl, conversationId, sendMessage, qc]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Group messages by date */
  type DateGroup = { label: string; msgs: typeof messages };
  const grouped: DateGroup[] = [];
  messages.forEach(msg => {
    const label = fmtDateLabel(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.label === label) last.msgs.push(msg);
    else grouped.push({ label, msgs: [msg] });
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 flex max-w-6xl w-full mx-auto" style={{ height: "calc(100vh - 64px)" }}>

        {/* ── Conversation list ── */}
        <aside className={`${conversationId ? "hidden md:flex" : "flex"} w-full md:w-72 flex-col border-r border-border bg-white shrink-0`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2.5">
              <MessageSquare className="w-4 h-4" style={{ color: GREEN }} />
              <span className="text-sm font-bold text-gray-900">Messages</span>
              {conversations.length > 0 && (
                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5" style={{ background: GREEN_LIGHT, color: GREEN }}>
                  {conversations.length}
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#0D3B27] transition-colors"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: GREEN }} />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">
                  {search ? "No conversations match your search" : "No conversations yet"}
                </p>
                {!search && <p className="text-xs text-gray-400 mt-1">Contact a seller from any product page</p>}
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const active = conv.id === conversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/messages/${conv.id}`)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-100 ${
                      active ? "bg-[#f4f8f6]" : "hover:bg-gray-50"
                    }`}
                    style={active ? { borderLeft: `3px solid ${GREEN}` } : {}}
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: active ? GREEN : "#4a7c6a" }}>
                        {conv.otherUser.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`text-xs truncate ${active ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
                          {conv.otherUser.name}
                        </p>
                        {conv.lastMessageAt && (
                          <p className="text-[10px] text-gray-400 shrink-0">{fmtConvTime(conv.lastMessageAt)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-[11px] text-gray-400 truncate flex-1">
                          {conv.lastMessage ?? <span className="italic">Start a conversation</span>}
                        </p>
                      </div>
                      <p className="text-[9px] mt-0.5 font-medium uppercase tracking-wide" style={{ color: GREEN }}>
                        {conv.otherUser.role}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Chat area ── */}
        <div className={`${conversationId ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-hidden`}>
          {!conversationId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50">
              <div className="w-16 h-16 flex items-center justify-center mb-4" style={{ background: GREEN_LIGHT }}>
                <MessageSquare className="w-7 h-7" style={{ color: GREEN }} />
              </div>
              <h3 className="font-bold text-gray-800 text-base">Select a conversation</h3>
              <p className="text-gray-400 text-sm mt-1">or contact a seller from a product page</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-3 bg-white shrink-0">
                <button onClick={() => navigate("/messages")} className="md:hidden text-gray-400 hover:text-gray-700 mr-1">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                {activeConv && (
                  <>
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white" style={{ background: GREEN }}>
                        {activeConv.otherUser.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{activeConv.otherUser.name}</p>
                      <p className="text-[10px] text-emerald-500 font-semibold">● Active now</p>
                    </div>
                    <span className="text-[10px] border border-gray-200 px-2 py-0.5 text-gray-500 capitalize font-medium">
                      {activeConv.otherUser.role}
                    </span>
                  </>
                )}
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50">
                {msgLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: GREEN }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 flex items-center justify-center mb-3" style={{ background: GREEN_LIGHT }}>
                      <MessageSquare className="w-5 h-5" style={{ color: GREEN }} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Say hello to get things started!</p>
                  </div>
                ) : (
                  grouped.map(group => (
                    <div key={group.label}>
                      {/* Date divider */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{group.label}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      <div className="space-y-2">
                        {group.msgs.map((msg, idx) => {
                          const isMe = msg.senderId === user?.id;
                          const prev = group.msgs[idx - 1];
                          const isSameAsPrev = prev && prev.senderId === msg.senderId;
                          const isLast = idx === group.msgs.length - 1;

                          return (
                            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                              {/* Avatar — only for others, only on last of a run */}
                              {!isMe && (
                                <div className={`w-6 h-6 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mb-0.5 ${isSameAsPrev ? "opacity-0" : ""}`}
                                  style={{ background: GREEN }}>
                                  {msg.senderName.slice(0, 2).toUpperCase()}
                                </div>
                              )}

                              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                                {!isSameAsPrev && !isMe && (
                                  <span className="text-[10px] text-gray-500 font-medium mb-0.5 ml-1">{msg.senderName}</span>
                                )}
                                <div className={`px-3 py-2 text-sm leading-relaxed break-words ${
                                  isMe
                                    ? "text-white"
                                    : "bg-white border border-gray-200 text-gray-800"
                                }`} style={isMe ? { background: GREEN } : {}}>
                                  {msg.content}
                                </div>
                                <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "flex-row-reverse" : ""}`}>
                                  <span className="text-[10px] text-gray-400">{fmtTime(msg.createdAt)}</span>
                                  {isMe && isLast && (
                                    <CheckCheck className="w-3 h-3 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Emoji panel */}
              {showEmoji && (
                <div className="px-4 pt-2 pb-0 bg-white border-t border-gray-100 flex flex-wrap gap-1.5">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => { setContent(c => c + emoji); inputRef.current?.focus(); }}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button onClick={() => setShowEmoji(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Attachment panel */}
              {showAttach && (
                <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    value={attachUrl}
                    onChange={e => setAttachUrl(e.target.value)}
                    placeholder="Paste a file or link URL..."
                    className="flex-1 text-xs border border-gray-200 px-2.5 py-1.5 focus:outline-none focus:border-[#0D3B27] transition-colors"
                  />
                  <button onClick={() => { setAttachUrl(""); setShowAttach(false); }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Input bar */}
              <form onSubmit={handleSend} className="border-t border-gray-200 px-3 py-3 bg-white flex items-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => { setShowEmoji(e => !e); setShowAttach(false); }}
                  className={`p-1.5 transition-colors shrink-0 ${showEmoji ? "text-[#0D3B27]" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAttach(a => !a); setShowEmoji(false); }}
                  className={`p-1.5 transition-colors shrink-0 ${showAttach || attachUrl ? "text-[#0D3B27]" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                    rows={1}
                    disabled={sending}
                    className="w-full resize-none border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0D3B27] transition-colors max-h-28 overflow-auto"
                    style={{ minHeight: "38px" }}
                  />
                  {content.length > 0 && (
                    <span className="absolute bottom-1.5 right-2 text-[9px] text-gray-300">
                      {content.length}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sending || (!content.trim() && !attachUrl.trim())}
                  className="flex items-center justify-center w-9 h-9 shrink-0 text-white transition-colors disabled:opacity-50"
                  style={{ background: GREEN }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
