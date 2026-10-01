import { useState } from "react";
import PublicLayout from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        toast.success("Message sent! We'll get back to you soon. (mock)");
        setForm({ name: "", email: "", subject: "", message: "" });
        return;
      }
      const res = await fetch(`${API_BASE}/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to send.");
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
    } finally { setLoading(false); }
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-20">
        <div className="container text-center">
          <h1 className="text-4xl font-bold text-primary-foreground md:text-5xl">Contact Us</h1>
          <p className="mt-4 max-w-xl mx-auto text-primary-foreground/70">
            Have questions? Reach out to the Kisii KUPPET team.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Get In Touch</h2>
            <div className="space-y-5">
              {[
                {
                  icon: MapPin,
                  title: "Office Address",
                  lines: ["Ngeka Centre, 1st Floor — Room 9", "Kisii Town, Kisii County, Kenya"],
                },
                {
                  icon: Mail,
                  title: "Email",
                  lines: ["kuppet.kisii@gmail.com"],
                },
                {
                  icon: Phone,
                  title: "Phone",
                  lines: ["+254 721 488 995"],
                },
                {
                  icon: Clock,
                  title: "Office Hours",
                  lines: ["Monday – Friday: 8:00 AM – 5:00 PM"],
                },
              ].map(({ icon: Icon, title, lines }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    {lines.map((l) => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-card p-6 shadow-card">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your full name" value={form.name} onChange={set("name")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={set("email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="How can we help?" value={form.subject} onChange={set("subject")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Your message..." rows={4} value={form.message} onChange={set("message")} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Message
            </Button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
