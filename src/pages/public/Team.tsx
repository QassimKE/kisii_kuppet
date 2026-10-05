import PublicLayout from "@/components/public/PublicLayout";
import { User } from "lucide-react";

const members = [
  { title: "Chairman",                      name: "Dennis M. Manase",          phone: "0725 457 423" },
  { title: "V/Chairman",                    name: "Steve Edwin Ogechi",         phone: "0723 069 235" },
  { title: "Executive Secretary",           name: "Kenyanchui Jared Abel",      phone: "0725 877 663" },
  { title: "Asst. Executive Secretary",     name: "Geoffrey O. Nyantika",       phone: "0713 305 715" },
  { title: "Treasurer",                     name: "Everlyne Peter",             phone: "0723 665 419" },
  { title: "V/Treasurer",                   name: "Omwange N. Irene",           phone: "0721 614 691" },
  { title: "Organizing Secretary",          name: "Ongaga N. Simeon",           phone: "0723 857 245" },
  { title: "Secretary Secondary",           name: "Ontita Wilfred",             phone: "0725 045 762" },
  { title: "Secretary Tertiary",            name: "Job Mokua Makori",           phone: "0704 228 282" },
  { title: "Secretary Junior Secondary",    name: "Duncan W. Ondieki",          phone: "0719 725 909" },
  { title: "Secretary Gender",              name: "Irene N. Mariga",            phone: "0723 648 094" },
  { title: "1st Assistant Sec. Gender",     name: "Lydia B. Kebati",            phone: "0724 847 441" },
  { title: "2nd Assistant Sec. Gender",     name: "L'okooli E. Lolimit",        phone: "0741 433 887" },
  { title: "3rd Assistant Sec. Gender",     name: "Zipporah B. James",          phone: "0701 762 343" },
];

const Team = () => (
  <PublicLayout>
    <section className="bg-gradient-hero py-20">
      <div className="container text-center">
        <h1 className="text-4xl font-bold text-primary-foreground md:text-5xl">Our Team</h1>
        <p className="mt-4 max-w-xl mx-auto text-primary-foreground/70">
          Meet the dedicated leadership of Kisii KUPPET Branch.
        </p>
      </div>
    </section>

    <section className="container py-16">
      <p className="text-center text-sm text-muted-foreground mb-10 italic">
        All correspondence through the Executive Secretary
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {members.map(({ title, name, phone }) => (
          <div key={title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary uppercase tracking-wide">{title}</p>
              <p className="mt-0.5 font-semibold text-foreground leading-snug">{name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{phone}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  </PublicLayout>
);

export default Team;
