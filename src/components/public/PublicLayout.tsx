import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

interface PublicLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const PublicLayout = ({ children, hideNav }: PublicLayoutProps) => (
  <div className="flex min-h-screen flex-col">
    {!hideNav && <Navbar />}
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default PublicLayout;
