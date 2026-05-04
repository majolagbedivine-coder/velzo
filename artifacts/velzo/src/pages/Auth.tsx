import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, ArrowLeft, Star, ChevronLeft, ChevronRight } from "lucide-react";

import velzoIcon from "@/assets/velzo-icon.jpg";
import testimonial1 from "@/assets/testimonial-1.png";
import testimonial2 from "@/assets/testimonial-2.png";
import testimonial3 from "@/assets/testimonial-3.png";

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    handle: "@sarahjdesign",
    role: "Templates & Themes Creator",
    image: testimonial1,
    quote: "Velzo doubled my monthly revenue in 60 days. The storefront is beautiful and checkout converts like nothing I've used before.",
    revenue: "$4,200/mo",
  },
  {
    name: "David Chen",
    handle: "@dchencode",
    role: "Software Developer",
    image: testimonial2,
    quote: "I spent 10 minutes setting up my store and made my first sale the same day. Licensing and tax handling is completely automatic.",
    revenue: "$8,750/mo",
  },
  {
    name: "Elena Rodriguez",
    handle: "@elenacreates",
    role: "Graphic Designer",
    image: testimonial3,
    quote: "Migrating from Selar was the best decision of my creator career. My conversion rate is up 40% and support is genuinely excellent.",
    revenue: "$3,100/mo",
  },
];

function TestimonialPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a === TESTIMONIALS.length - 1 ? 0 : a + 1));
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <div className="relative h-full flex flex-col justify-between p-12 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(29,97,70,0.4) 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={velzoIcon} alt="Velzo" className="w-8 h-8 rounded-lg object-cover brightness-0 invert" />
        <span className="text-2xl font-bold tracking-tight text-white">Velzo</span>
      </div>

      {/* Testimonial */}
      <div className="flex-1 flex flex-col justify-center py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
          >
            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-white/80 text-white/80" />
              ))}
            </div>

            <blockquote className="text-white/95 text-2xl font-medium leading-relaxed mb-8">
              "{t.quote}"
            </blockquote>

            <div className="flex items-center gap-4">
              <img
                src={t.image}
                alt={t.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              />
              <div>
                <div className="font-bold text-white">{t.name}</div>
                <div className="text-white/60 text-sm">{t.handle} · {t.role}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-white font-bold text-lg">{t.revenue}</div>
                <div className="text-white/50 text-xs">avg revenue</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex items-center gap-3 mt-10">
          <button
            onClick={() => setActive((a) => (a === 0 ? TESTIMONIALS.length - 1 : a - 1))}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-8 bg-white" : "w-1.5 bg-white/30"}`}
              />
            ))}
          </div>
          <button
            onClick={() => setActive((a) => (a === TESTIMONIALS.length - 1 ? 0 : a + 1))}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="text-white/40 text-sm font-medium">
        Join 10,000+ creators selling on Velzo
      </div>
    </div>
  );
}

interface AuthFormProps {
  mode: "login" | "signup";
}

function AuthForm({ mode }: AuthFormProps) {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const isLogin = mode === "login";

  return (
    <div className="flex flex-col h-full p-8 md:p-12 lg:p-16 justify-center">
      <div className="max-w-md w-full mx-auto">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" />
          Back to Velzo
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Sign in to your Velzo account to continue."
              : "Start selling digital products in minutes. Free forever."}
          </p>
        </div>

        {/* Google OAuth button */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl mb-6 font-medium text-base flex items-center gap-3"
          type="button"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative mb-6">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 bg-background px-3 text-xs text-muted-foreground font-medium">
            or continue with email
          </span>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(isLogin ? "/" : "/");
          }}
          className="space-y-5"
        >
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl px-4 text-base"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl px-4 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              {isLogin && (
                <Link href="#" className="text-xs text-primary font-medium hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={isLogin ? "Your password" : "Create a password (min 8 chars)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl px-4 pr-12 text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <p className="text-xs text-muted-foreground">
              By creating an account you agree to our{" "}
              <Link href="#" className="text-primary hover:underline font-medium">Terms of Service</Link>
              {" "}and{" "}
              <Link href="#" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
            </p>
          )}

          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold mt-2">
            {isLogin ? "Sign in" : "Create free account"}
          </Button>
        </form>

        {/* Switch mode */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? "Sign up free" : "Sign in"}
          </Link>
        </p>

        {/* Help */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Need help?{" "}
          <a href="mailto:hello@velzo.co" className="text-primary hover:underline">
            hello@velzo.co
          </a>
        </p>
      </div>
    </div>
  );
}

export default function Auth({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — testimonials */}
      <div className="hidden lg:flex w-[480px] xl:w-[560px] shrink-0 bg-primary flex-col">
        <TestimonialPanel />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-background overflow-y-auto">
        <AuthForm mode={mode} />
      </div>
    </div>
  );
}
