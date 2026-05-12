import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import {
  useListConversations,
  useListMessages,
  useSendMessage,
} from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Messages() {
  const { id } = useParams<{ id?: string }>();
  const conversationId = id ? Number(id) : null;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: conversations = [], isLoading: convLoading } = useListConversations();
  const { data: messages = [], isLoading: msgLoading } = useListMessages(
    conversationId ?? 0,
    { query: { enabled: !!conversationId, queryKey: [`/api/conversations/${conversationId}/messages`] } }
  );
  const sendMessage = useSendMessage();

  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const activeConv = conversations.find((c) => c.id === conversationId);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !conversationId) return;
    setSending(true);
    try {
      await sendMessage.mutateAsync({ conversationId, data: { content: content.trim() } });
      setContent("");
      qc.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 flex max-w-6xl w-full mx-auto">
        {/* Conversation list */}
        <aside className={`${conversationId ? "hidden md:flex" : "flex"} w-full md:w-72 flex-col border-r border-border bg-card shrink-0`}>
          <div className="px-4 py-3.5 border-b border-border flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Messages</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Contact a seller from any product page</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3.5 transition-colors border-b border-border ${
                    conv.id === conversationId
                      ? "bg-primary/10 border-l-2 border-l-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="w-9 h-9 bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                    {conv.otherUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.otherUser.name}</p>
                    {conv.lastMessage && <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat area */}
        <div className={`${conversationId ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
          {!conversationId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-medium">Select a conversation</h3>
              <p className="text-muted-foreground text-sm mt-1">or contact a seller from a product page</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-border px-5 py-3.5 flex items-center gap-3 bg-card">
                <button
                  onClick={() => navigate("/messages")}
                  className="md:hidden mr-1 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                {activeConv && (
                  <>
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {activeConv.otherUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{activeConv.otherUser.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{activeConv.otherUser.role}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {msgLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                        {!isMe && (
                          <div className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                            {msg.senderName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className={`max-w-xs px-4 py-2.5 text-sm leading-relaxed ${
                          isMe ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-3 bg-card">
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-none"
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !content.trim()} className="px-4">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
