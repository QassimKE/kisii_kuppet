import PublicLayout from "@/components/public/PublicLayout";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, ArrowRight, Bus, FileText, ShieldCheck, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "/logo.png";
// import heroImage from "/hero.jpeg";
import logo from "/logo.png";
import { useAuth } from "@/context/AuthContext";

const features = [
  {
    icon: Calendar,
    title: "Events",
    description: "Stay updated with upcoming Kisii KUPPET events and meetings.",
    href: "/member/events",
  },
  {
    icon: Users,
    title: "Member Portal",
    description: "Access your personal dashboard, history, and profile settings.",
    href: "/member-dashboard",
  },
  {
    icon: Bus,
    title: "Van Booking",
    description: "Request transport for official duties and track approval status.",
    href: "/van-booking",
  },
  {
    icon: FileText,
    title: "Claims",
    description: "Submit BBF welfare claims online with required documents and track progress.",
    href: "/claims",
  },
];

const stats = [
  { icon: Users, value: "2,400+", label: "Registered Members" },
  { icon: ShieldCheck, value: "98%", label: "Claims Processed" },
  { icon: TrendingUp, value: "KES 12M+", label: "Welfare Disbursed" },
  { icon: Award, value: "15+", label: "Years of Service" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5 },
  }),
};

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleFeatureClick = (href: string) => {
    if (isAuthenticated && user?.role === "member") {
      navigate(href);
    } else {
      navigate("/login", { state: { from: { pathname: href } } });
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative z-10 flex flex-col items-center py-24 text-center md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-1.5 text-sm text-primary-foreground/80 backdrop-blur-sm"
          >
            <img src={logo} alt="KUPPET" className="h-4 w-4 rounded object-contain" />
            Kisii KUPPET Welfare System
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl text-4xl font-bold leading-tight text-primary-foreground md:text-6xl"
          >
            Empowering Kisii Teachers Through{" "}
            <span className="text-accent">Welfare Support</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-primary-foreground/70"
          >
            Submit BBF claims, book the KUPPET van, and stay connected — all in one
            secure platform built for Kisii KUPPET members.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/login">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-primary/5 border-y border-primary/10">
        <div className="container py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Everything You Need
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            A complete welfare management system designed for Kisii KUPPET members.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Card
                className="h-full shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 cursor-pointer group"
                onClick={() => handleFeatureClick(f.href)}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-primary py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-3 text-primary-foreground/70 max-w-md mx-auto">
            Join the platform and manage your welfare needs seamlessly.
          </p>
          <Button variant="hero" size="lg" className="mt-8" asChild>
            <Link to="/login">
              Access Member Portal <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
};
export default Index;
