import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "/logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/team", label: "Team" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50">
      {/* Top info bar */}
      <div className="hidden md:block bg-primary text-primary-foreground/80 text-xs">
        <div className="container flex items-center justify-between py-1.5">
          <span className="font-medium tracking-wide uppercase text-primary-foreground/60">
            Kenya Union of Post Primary Education Teachers — Kisii Branch
          </span>
          <div className="flex items-center gap-4">
            <a href="tel:+254721488995" className="flex items-center gap-1 hover:text-primary-foreground transition-colors">
              <Phone className="h-3 w-3" /> +254 721 488 995
            </a>
            <a href="mailto:kuppet.kisii@gmail.com" className="flex items-center gap-1 hover:text-primary-foreground transition-colors">
              <Mail className="h-3 w-3" /> kuppet.kisii@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Kisii KUPPET" className="h-9 w-9 rounded-lg object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="font-heading text-base font-bold text-foreground tracking-tight">
                KUPPET <span className="text-primary">KISII</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">Welfare Management System</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  location.pathname === link.to
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/login">Member Portal</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-b border-border bg-card md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  location.pathname === link.to ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" onClick={() => setOpen(false)}>Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/login" onClick={() => setOpen(false)}>Member Portal</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
