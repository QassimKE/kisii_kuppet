import { useEffect, useState } from "react";
import PublicLayout from "@/components/public/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Loader2 } from "lucide-react";
import { publicService } from "@/services/public.service";
import type { Event } from "@/services/types";

type Filter = "all" | "upcoming" | "past";

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    publicService.getEvents()
      .then(setEvents)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load events."))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? events : events.filter((e) => e.status === filter);

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-20">
        <div className="container text-center">
          <h1 className="text-4xl font-bold text-primary-foreground md:text-5xl">
            Events
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-primary-foreground/70">
            Stay informed about upcoming Kisii KUPPET activities and
            gatherings.
          </p>
        </div>
      </section>

      <section className="container py-16">
        {/* Filter pills */}
        <div className="flex gap-2 mb-8">
          {(["all", "upcoming", "past"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-destructive py-12">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">
            No events found.
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((event) => (
            <Card
              key={event.id}
              className="shadow-card hover:shadow-card-hover transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {event.title}
                  </h3>
                  <Badge
                    variant={
                      event.status === "upcoming" ? "default" : "secondary"
                    }
                  >
                    {event.status === "upcoming" ? "Upcoming" : "Past"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {event.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {event.location}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Events;
