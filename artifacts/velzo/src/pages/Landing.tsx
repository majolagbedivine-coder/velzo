import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, CheckCircle2, Zap, Globe2, ShoppingBag, 
  BarChart3, Link as LinkIcon, Tag, ShieldCheck, 
  BookOpen, GraduationCap, Code, LayoutTemplate, 
  Music, Palette, Camera, Video, Type, Puzzle, 
  Settings2, Box, FileSpreadsheet, Image as ImageIcon, 
  FileText, Terminal, Gamepad2, Mic, Wrench, Calendar
} from "lucide-react";

import heroMockup from "@/assets/hero-mockup.png";
import testimonial1 from "@/assets/testimonial-1.png";
import testimonial2 from "@/assets/testimonial-2.png";
import testimonial3 from "@/assets/testimonial-3.png";

const CATEGORIES = [
  { name: "eBooks & Publications", icon: BookOpen },
  { name: "Online Courses", icon: GraduationCap },
  { name: "Software & Apps", icon: Code },
  { name: "Templates & Themes", icon: LayoutTemplate },
  { name: "Music & Audio", icon: Music },
  { name: "Graphics & Design", icon: Palette },
  { name: "Photography", icon: Camera },
  { name: "Video & Film", icon: Video },
  { name: "Fonts & Typography", icon: Type },
  { name: "Plugins & Extensions", icon: Puzzle },
  { name: "Presets & Filters", icon: Settings2 },
  { name: "3D Models", icon: Box },
  { name: "Spreadsheets & Tools", icon: FileSpreadsheet },
  { name: "Digital Art & NFTs", icon: ImageIcon },
  { name: "Research & Reports", icon: FileText },
  { name: "Scripts & Code", icon: Terminal },
  { name: "Games & Assets", icon: Gamepad2 },
  { name: "Podcasts", icon: Mic },
  { name: "SaaS Tools", icon: Wrench },
  { name: "Virtual Events", icon: Calendar },
];

const FEATURES = [
  { title: "Instant Delivery", description: "Buyers get their files immediately after purchase, 24/7.", icon: Zap },
  { title: "No Platform Lock-in", description: "Take your audience and data anywhere. You own it.", icon: LinkIcon },
  { title: "Global Payments", description: "Accept payments from anywhere in the world effortlessly.", icon: Globe2 },
  { title: "Custom Storefront", description: "Design a store that matches your unique brand identity.", icon: ShoppingBag },
  { title: "Analytics Dashboard", description: "Deep insights into your sales, traffic, and audience.", icon: BarChart3 },
  { title: "Affiliate Program", description: "Let others sell your products for a commission.", icon: CheckCircle2 },
  { title: "Discount Codes", description: "Create flexible promotional campaigns for your audience.", icon: Tag },
  { title: "Secure Licensing", description: "Protect your software with built-in license key generation.", icon: ShieldCheck },
];

const TESTIMONIALS = [
  { name: "Sarah Jenkins", handle: "@sarahjdesign", category: "Templates & Themes", image: testimonial1, quote: "Velzo completely changed how I sell my Notion templates. The analytics are incredible and the checkout is seamless." },
  { name: "David Chen", handle: "@dchencode", category: "Software & Apps", image: testimonial2, quote: "As a developer, I appreciate platforms that just work. Velzo handles licensing and global taxes so I can focus on coding." },
  { name: "Elena Rodriguez", handle: "@elenacreates", category: "Graphics & Design", image: testimonial3, quote: "I migrated from Selar and haven't looked back. The design is cleaner, my conversion rate is up 40%, and the support is top-notch." },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Announcement Banner */}
      <div className="bg-[#FEF3C6] py-2 px-4 text-center text-sm font-medium text-amber-900 border-b border-amber-200">
        <span className="inline-flex items-center justify-center">
          Velzo is now live — start selling your digital products today <ArrowRight className="ml-1 h-4 w-4" />
        </span>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">V</div>
            Velzo
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
            <Link href="#sellers" className="text-muted-foreground hover:text-foreground transition-colors">Sellers</Link>
            <Link href="#categories" className="text-muted-foreground hover:text-foreground transition-colors">Categories</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
            <Button className="rounded-xl px-6">Get Started</Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
              <motion.div 
                className="flex-1 max-w-2xl text-center lg:text-left"
                initial="hidden" animate="visible" variants={stagger}
              >
                <motion.h1 variants={fadeIn} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                  The smartest way to sell <span className="text-primary relative inline-block">
                    digital products
                    <div className="absolute -bottom-2 left-0 w-full h-3 bg-[#FEF3C6] -z-10 rounded-full opacity-80 rotate-1"></div>
                  </span> online.
                </motion.h1>
                
                <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0">
                  Join thousands of creators monetizing their expertise globally. Zero monthly fees, instant payouts, and a beautiful storefront.
                </motion.p>
                
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto lg:mx-0 mb-8">
                  <Input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="h-14 px-5 rounded-xl bg-card border-card-border focus-visible:ring-primary shadow-sm text-base"
                  />
                  <Button size="lg" className="h-14 px-8 rounded-xl w-full sm:w-auto shrink-0 text-base font-semibold">
                    Start Selling Free
                  </Button>
                </motion.div>
                
                <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> SSL Secure</span>
                  <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> Instant Delivery</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> No Monthly Fees</span>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex-1 w-full max-w-3xl relative"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-3xl -z-10 transform rotate-3"></div>
                <div className="bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden p-2">
                  <img src={heroMockup} alt="Velzo Dashboard" className="w-full h-auto rounded-[1.5rem] object-cover" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-10 border-y border-border bg-card/30">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">Trusted by top creators from</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
              {['Notion', 'Figma', 'Framer', 'Webflow', 'Stripe', 'Gumroad'].map((brand, i) => (
                <span key={i} className="text-xl md:text-2xl font-bold tracking-tight font-serif">{brand}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-primary-foreground/20">
              <div className="flex flex-col gap-2">
                <span className="text-4xl md:text-5xl font-bold">50k+</span>
                <span className="text-primary-foreground/80 font-medium">Products Sold</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-4xl md:text-5xl font-bold">120+</span>
                <span className="text-primary-foreground/80 font-medium">Countries Reached</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-4xl md:text-5xl font-bold">10k+</span>
                <span className="text-primary-foreground/80 font-medium">Active Creators</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-4xl md:text-5xl font-bold">Zero</span>
                <span className="text-primary-foreground/80 font-medium">Monthly Fees</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Showcase */}
        <section className="py-24 px-4" id="categories">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 text-primary bg-primary/5 border-primary/20 hover:bg-primary/10 py-1.5 px-4 text-sm font-semibold">Marketplace</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Sell literally anything digital</h2>
              <p className="text-lg text-muted-foreground">From comprehensive video courses to single-file Notion templates, Velzo handles the delivery perfectly.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {CATEGORIES.map((category, i) => (
                <Card key={i} className="group hover:border-primary/50 transition-colors duration-300 cursor-pointer bg-card border-card-border shadow-none">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-sm border border-border">
                      <category.icon className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-sm">{category.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-4 bg-background" id="how-it-works">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 text-primary bg-primary/5 border-primary/20 hover:bg-primary/10 py-1.5 px-4 text-sm font-semibold">How it works</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">From sign up to first sale in minutes</h2>
              <p className="text-lg text-muted-foreground">We eliminated the friction of selling online. Set up your store, upload your files, and start receiving payments immediately.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
              <div className="flex-1 w-full space-y-6">
                <div className="flex gap-6 p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">1</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Create your store</h3>
                    <p className="text-muted-foreground leading-relaxed">Sign up, customize your brand colors, and connect your payout method. We support creators in over 120 countries.</p>
                  </div>
                </div>
                
                <div className="flex gap-6 p-6 rounded-2xl bg-background border border-border opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-lg shrink-0 border border-border">2</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Upload your products</h3>
                    <p className="text-muted-foreground leading-relaxed">Drag and drop your digital files, set your price, and add a beautiful cover image. We handle the secure hosting.</p>
                  </div>
                </div>
                
                <div className="flex gap-6 p-6 rounded-2xl bg-background border border-border opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-lg shrink-0 border border-border">3</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Get paid instantly</h3>
                    <p className="text-muted-foreground leading-relaxed">Share your unique product link. When someone buys, they get the file instantly, and the money goes straight to your account.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-3xl -z-10 transform -rotate-3"></div>
                <div className="bg-card rounded-[2rem] border border-border shadow-2xl p-4 md:p-8">
                  <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="border-b border-border p-4 bg-card/50 flex items-center gap-4">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive/50"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400/50"></div>
                        <div className="w-3 h-3 rounded-full bg-primary/50"></div>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono flex-1 text-center bg-background py-1.5 rounded-md border border-border">velzo.com/store/setup</div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">Logo</div>
                        <div>
                          <div className="h-5 w-32 bg-muted rounded-md mb-2"></div>
                          <div className="h-4 w-24 bg-muted/50 rounded-md"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="h-4 w-24 bg-muted rounded-md mb-2"></div>
                          <div className="h-10 w-full bg-background border border-border rounded-lg"></div>
                        </div>
                        <div>
                          <div className="h-4 w-32 bg-muted rounded-md mb-2"></div>
                          <div className="h-10 w-full bg-background border border-border rounded-lg"></div>
                        </div>
                        <div className="pt-4">
                          <div className="h-10 w-32 bg-primary rounded-lg ml-auto"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4 bg-card/50 border-y border-border" id="features">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to scale</h2>
              <p className="text-lg text-muted-foreground">Powerful tools hidden behind a beautifully simple interface. Built for creators who mean business.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, i) => (
                <Card key={i} className="bg-background border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-4" id="sellers">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Loved by serious creators</h2>
              <p className="text-lg text-muted-foreground">Don't just take our word for it. Here's what independent creators think about Velzo.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <Card key={i} className="bg-card border-border shadow-sm h-full flex flex-col">
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                      <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-background" />
                      <div>
                        <h4 className="font-bold text-lg">{t.name}</h4>
                        <p className="text-sm text-muted-foreground">{t.handle}</p>
                      </div>
                    </div>
                    <p className="text-lg leading-relaxed flex-1">"{t.quote}"</p>
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <span className="text-sm font-semibold text-primary">{t.category} seller</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10"></div>
          <div className="container mx-auto text-center max-w-4xl">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">Ready to launch your digital empire?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join Velzo today and get your first product live in under 5 minutes. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-10 rounded-xl text-lg font-bold w-full sm:w-auto">
                Get Started for Free
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-xl text-lg font-bold w-full sm:w-auto bg-background">
                View Pricing
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border pt-20 pb-10 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">V</div>
                Velzo
              </Link>
              <p className="text-muted-foreground max-w-sm mb-6">
                The smartest, most organized digital marketplace on the internet. Built for serious creators to monetize their expertise.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Marketplace</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Creator Guide</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">API Docs</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Partners</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} Velzo Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}