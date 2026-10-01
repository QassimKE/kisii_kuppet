import PublicLayout from "@/components/public/PublicLayout";
import { Shield, Users, Heart, Target } from "lucide-react";

const values = [
  { icon: Shield, title: "Integrity", description: "Transparent governance and accountability in all operations." },
  { icon: Users, title: "Solidarity", description: "Standing together for the rights and welfare of every educator." },
  { icon: Heart, title: "Compassion", description: "Supporting members through difficult times with care and empathy." },
  { icon: Target, title: "Excellence", description: "Delivering efficient services that exceed expectations." },
];

const About = () => (
  <PublicLayout>
    <section className="bg-gradient-hero py-20">
      <div className="container text-center">
        <h1 className="text-4xl font-bold text-primary-foreground md:text-5xl">About Us</h1>
        <p className="mt-4 max-w-xl mx-auto text-primary-foreground/70">
          Kisii KUPPET Welfare is dedicated to supporting teachers through welfare services, advocacy, and community.
        </p>
      </div>
    </section>

    <section className="container py-16">
      <div className="max-w-3xl mx-auto space-y-8 text-muted-foreground">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
          <p>
            To provide comprehensive welfare support to KUPPET members in Kisii County, ensuring every educator has access to timely financial assistance, transport services, and community resources during times of need.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Our Vision</h2>
          <p>
            A united teaching community in Kisii County where every member's welfare is safeguarded through modern, efficient, and transparent systems.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Our History</h2>
          <p>
            The Kisii KUPPET Branch has served educators across Kisii County for over 15 years. From humble beginnings as a small welfare committee, the branch has grown into a fully-fledged organisation managing burial benefit funds, transport logistics, and member advocacy — now supported by this digital platform to serve members faster and more transparently.
          </p>
        </div>
      </div>
    </section>

    <section className="bg-muted py-16">
      <div className="container">
        <h2 className="text-2xl font-bold text-foreground text-center mb-10">Our Core Values</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl bg-card p-6 shadow-card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <v.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default About;
