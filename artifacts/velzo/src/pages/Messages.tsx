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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, Loader2 } from "lucide-react";

export default function Messages() {
  const { id } = useParams<{ id?: string }>();
  const conversationId = id ? Number(id) : null;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: conversations = [], isLoading: convLoading } = useListConversations();
  const { data: messages = [], isLoading: msgLoading } = useListMessages(
    conversationId ?? 0,
    {
      query: {
        enabled: !!conversationId,
        queryKey: [`/api/conversations/${conversationId}/messages`],
      },
    }
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
      await sendMessage.mutateAsync({
        conversationId,
        data: { content: content.trim() },
      });
      setContent("");
      qc.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F1]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#1D6146]" />
          Messages
        </h1>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex h-[calc(100vh-220px)]">
          {/* Sidebar */}
          <aside className="w-72 border-r border-gray-100 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {convLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[#1D6146]" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/messages/${conv.id}`)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                      conv.id === conversationId
                        ? "bg-[#1D6146]/8 border-r-2 border-[#1D6146]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback className="bg-[#1D6146]/10 text-[#1D6146] text-xs font-bold">
                        {conv.otherUser.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{conv.otherUser.name}</p>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {!conversationId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
                <h3 className="text-gray-500 font-medium">Select a conversation</h3>
                <p className="text-gray-400 text-sm mt-1">or contact a seller from a product page</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="border-b border-gray-100 px-5 py-4 flex items-center gap-3">
                  {activeConv && (
                    <>
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-[#1D6146]/10 text-[#1D6146] text-xs font-bold">
                          {activeConv.otherUser.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{activeConv.otherUser.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{activeConv.otherUser.role}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {msgLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-[#1D6146]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-gray-400">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                        >
                          {!isMe && (
                            <Avatar className="w-7 h-7 shrink-0">
                              <AvatarFallback className="bg-[#1D6146]/10 text-[#1D6146] text-xs font-bold">
                                {msg.senderName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-xs px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? "bg-[#1D6146] text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-800 rounded-bl-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="border-t border-gray-100 p-4 flex gap-3">
                  <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border-gray-200"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    disabled={sending || !content.trim()}
                    className="bg-[#1D6146] text-white hover:bg-[#174f38] rounded-xl px-4"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
