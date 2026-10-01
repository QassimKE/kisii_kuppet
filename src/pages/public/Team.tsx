import PublicLayout from "@/components/public/PublicLayout";
import teamImage from "/team.jpeg";

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
      <div className="max-w-4xl mx-auto">
        <img
          src={teamImage}
          alt="Kisii KUPPET Team"
          className="w-full rounded-2xl shadow-lg object-cover"
        />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Kisii KUPPET Branch Leadership Team
        </p>
      </div>
    </section>
  </PublicLayout>
);

export default Team;
