import CTASection from "@/components/landing-page/cta-section";
import FeaturesSection from "@/components/landing-page/features-section";
import FooterSection from "@/components/landing-page/footer-section";
import HeroSection from "@/components/landing-page/hero-section";
import LandingNavbar from "@/components/landing-page/landing-navbar";
import TechStackSection from "@/components/landing-page/tech-section";
import TestimonialsSection from "@/components/landing-page/testimonial-section";

export default function Index() {
  
  return (
    <main className="min-h-screen flex flex-col">
    <LandingNavbar />
    <HeroSection />
    <FeaturesSection />
    <TechStackSection />
    <TestimonialsSection />
    <CTASection />
    <FooterSection />
    </main>
  );
}