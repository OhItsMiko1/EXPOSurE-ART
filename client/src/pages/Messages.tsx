import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/local-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Conversation, Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageCircle } from "lucide-react";

export default function Messages() {
  const { userId: otherUserIdParam } = useParams<{ userId?: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [draft, setDraft] = useState("");

  const otherUserId = otherUserIdParam ? parseInt(otherUserIdParam) : undefined;

  if (!user) {
    navigate("/login");
    return null;
  }

  const { data: conversations, isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ['/api/messages/conversations'],
  });

  const { data: thread, isLoading: isLoadingThread } = useQuery<Message[]>({
    queryKey: [`/api/messages/${otherUserId}`],
    enabled: !!otherUserId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!otherUserId) return;
      return apiRequest('POST', '/api/messages', {
        receiverId: otherUserId,
        content: draft,
      });
    },
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${otherUserId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    },
    onError: () => {
      toast({
        title: "Message failed to send",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessageMutation.mutate();
  };

  const activeConversation = conversations?.find(c => c.otherUser.id === otherUserId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Conversation list */}
        <Card className="md:col-span-1 overflow-hidden">
          {isLoadingConversations ? (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MessageCircle className="mx-auto h-8 w-8 mb-2 text-gray-300" />
              <p>No conversations yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map(({ otherUser, lastMessage, unreadCount }) => (
                <button
                  key={otherUser.id}
                  onClick={() => navigate(`/messages/${otherUser.id}`)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${
                    otherUserId === otherUser.id ? "bg-gray-100" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={otherUser.profileImage ?? undefined} alt={otherUser.username} />
                    <AvatarFallback className="bg-primary text-white">
                      {otherUser.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline">
                      <p className="font-medium text-gray-800 truncate">{otherUser.fullName || otherUser.username}</p>
                      {unreadCount > 0 && (
                        <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 ml-2 shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{lastMessage.content}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Thread */}
        <Card className="md:col-span-2 flex flex-col h-[600px]">
          {!otherUserId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to view messages.
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activeConversation?.otherUser.profileImage ?? undefined} />
                  <AvatarFallback className="bg-primary text-white">
                    {(activeConversation?.otherUser.username ?? "?").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-gray-800">
                  {activeConversation?.otherUser.fullName || activeConversation?.otherUser.username || "Conversation"}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingThread ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : !thread || thread.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
                ) : (
                  thread.map((message) => {
                    const isMine = message.senderId === user.id;
                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                            isMine ? "bg-primary text-white" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="min-h-0 h-10 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <Button type="submit" disabled={!draft.trim() || sendMessageMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
