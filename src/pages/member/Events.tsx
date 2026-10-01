import { useEffect, useState } from "react";
import MemberLayout from "@/components/member/MemberLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { memberService } from "@/services/member.service";
import type { Event } from "@/services/types";

type Filter = "all" | "upcoming" | "past";

const MemberEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");

  useEffect(() => {
    memberService.getEvents().then(setEvents);
  }, []);

  const filtered = events.filter((e) => filter === "all" || e.status === filter);

  const upcomingCount = events.filter((e) => e.status === "upcoming").length;
  const pastCount     = events.filter((e) => e.status === "past").length;

  const filters: { key: Filter; label: string }[] = [
    { key: "upcoming", label: `Upcoming (${upcomingCount})` },
    { key: "past",     label: `Past (${pastCount})` },
    { key: "all",      label: `All (${events.length})` },
  ];

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground">Stay informed about upcoming Kisii KUPPET activities.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Events grid */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">No events found.</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((event) => (
            <Card
              key={event.id}
              className={cn(
                "shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5",
                event.status === "past" && "opacity-75"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold text-foreground leading-snug">{event.title}</h3>
                  <Badge
                    variant={event.status === "upcoming" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {event.status === "upcoming" ? "Upcoming" : "Past"}
                  </Badge>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {event.location}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MemberLayout>
  );
};

export default MemberEvents;
