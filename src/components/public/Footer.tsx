import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import logo from "/logo.png";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <img src={logo} alt="Kisii KUPPET" className="h-8 w-8 rounded-lg object-contain" />
            <span className="font-heading text-base font-bold text-foreground">Kisii KUPPET</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Empowering Kisii teachers through welfare support and collective advocacy.
          </p>
          <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" /> Magsons Plaza, 1st Floor Room 2, Hospital Road, Kisii</div>
            <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0" /> 058-30140 / 0725 877 663</div>
            <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 shrink-0" /> kuppet.kisiicounty@yahoo.com</div>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {[
              { to: "/about", label: "About Us" },
              { to: "/team", label: "Our Team" },
              { to: "/events", label: "Events" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Member Services</h4>
          <div className="flex flex-col gap-2">
            {[
              { to: "/login", label: "Member Login" },
              { to: "/member/events", label: "Events Calendar" },
              { to: "/van-booking", label: "Van Booking" },
              { to: "/claims", label: "Submit a Claim" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">About KUPPET</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Kenya Union of Post Primary Education Teachers (KUPPET) Kisii Branch serves educators across Kisii County, championing their rights and welfare.
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Kisii KUPPET Welfare. All rights reserved.</span>
        <span>Powered by KUPPET Kisii Branch</span>
      </div>
    </div>
  </footer>
);

export default Footer;
