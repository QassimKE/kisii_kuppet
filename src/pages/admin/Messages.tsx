import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, RefreshCw, Mail, Clock } from "lucide-react";
import { api } from "@/services/api";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const load = () => {
    setLoading(true);
    api.get<ContactMessage[]>("/admin/messages")
      .then(setMessages)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (msg: ContactMessage) => {
    if (msg.read) { setSelected(msg); return; }
    await api.patch(`/admin/messages/${msg.id}/read`, {});
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    setSelected({ ...msg, read: true });
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contact Messages</h1>
            <p className="text-sm text-muted-foreground">{unread} unread message{unread !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="outline" size="icon" onClick={load} disabled={loading} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Message list */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-primary" /> Inbox
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
              ) : messages.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {messages.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => markRead(m)}
                      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${selected?.id === m.id ? "bg-muted/50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {!m.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                            <p className={`text-sm truncate ${!m.read ? "font-semibold text-foreground" : "text-foreground"}`}>{m.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{m.subject}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.message}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-muted-foreground">{m.createdAt}</p>
                          {!m.read && <Badge className="mt-1 text-xs">New</Badge>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message detail */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-primary" /> Message Detail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <p className="text-sm text-muted-foreground text-center py-12">Select a message to read it.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="font-semibold text-foreground">{selected.name}</p>
                    <p className="text-sm text-muted-foreground">{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Subject</p>
                    <p className="font-medium text-foreground">{selected.subject}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {selected.createdAt}
                  </div>
                  <div className="rounded-md bg-muted p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </div>
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" /> Reply via email
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Messages;
