import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, BookOpen, Compass, Sparkles, Clock, Users, Star, Share2, Instagram } from "lucide-react";
import {
  useJoinWaitlist,
  useGetWaitlistCount,
  getGetWaitlistCountQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import boxArt from "@assets/IMG-20260126-WA0001_1779350196491.jpg";
import dividerGraphic from "@assets/baghdad-icon-transparent.png";
import { CountryCombobox } from "@/components/country-combobox";
import { t, type Lang } from "@/lib/translations";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
});

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasJoined, setHasJoined] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const tx = t[lang];
  const isAr = lang === "ar";

  const { data: countData } = useGetWaitlistCount({
    query: {
      queryKey: getGetWaitlistCountQueryKey(),
    },
  });

  const joinWaitlist = useJoinWaitlist();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
    },
  });

async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Create a fake loading state while sending data to Google Sheets
      const submitButton = document.querySelector('[data-testid="button-submit-waitlist"]');
      if (submitButton) submitButton.setAttribute("disabled", "true");

      const response = await fetch("https://api.sheetmonkey.io/form/sC9m4YvmsTzMLy1u1aDnaU", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          country: values.country,
          date: new Date().toLocaleDateString()
        })
      });

      if (response.ok) {
        setHasJoined(true);
        toast({
          title: tx.toastSuccessTitle,
          description: tx.toastSuccessDesc,
        });
      } else {
        throw new Error("Sheet Monkey connection failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: tx.toastErrorTitle,
        description: tx.toastErrorDesc,
        variant: "destructive",
      });
    } finally {
      const submitButton = document.querySelector('[data-testid="button-submit-waitlist"]');
      if (submitButton) submitButton.removeAttribute("disabled");
    }
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary selection:text-primary-foreground"
      style={{ fontFamily: isAr ? "'Noto Sans Arabic', sans-serif" : undefined }}
    >
      {/* Language toggle */}
      <div className="fixed top-4 right-4 z-50" style={isAr ? { right: "auto", left: "1rem" } : {}}>
        <Button
          data-testid="button-lang-toggle"
          variant="outline"
          size="sm"
          onClick={() => setLang(isAr ? "en" : "ar")}
          className="rounded-full border-primary/30 bg-card/80 backdrop-blur-sm text-foreground hover:border-primary/60 text-sm"
        >
          {tx.langToggle}
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={boxArt}
            alt="Hikma board game box art"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mx-auto w-56 md:w-72 rounded-xl overflow-hidden border-2 border-primary/60 shadow-2xl shadow-black/80 ring-1 ring-primary/20">
            <img src={boxArt} alt="Hikma game box" className="w-full h-full object-cover" />
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold text-foreground leading-[1.1] drop-shadow-lg"
            style={{ fontFamily: "'Cinzel', serif", fontWeight: 900 }}
          >
            {tx.heroTitle1} <span className="text-primary italic">{tx.heroTitle2}</span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto font-light leading-relaxed drop-shadow">
            {tx.heroSubtitle}
          </p>

          <div className="pt-4">
            <Button
              data-testid="button-join-ledger"
              size="lg"
              className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30"
              onClick={() => {
                document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {isAr ? (
                <>
                  <ArrowRight className="mr-2 w-5 h-5 rotate-180" />
                  {tx.heroCta}
                </>
              ) : (
                <>
                  {tx.heroCta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Game Stats Section */}
      <section className="py-16 px-6 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-primary/20 bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-foreground">30–60</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest">{tx.statsMinutes}</p>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-primary/20 bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-foreground">2–6</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest">{tx.statsPlayers}</p>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-primary/20 bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Star className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-foreground">10+</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest">{tx.statsYears}</p>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-32 px-6 bg-card relative z-20 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4 p-6 group">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500 border border-primary/20">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{tx.pillarsTitle1}</h3>
              <p className="text-muted-foreground leading-relaxed">{tx.pillarsDesc1}</p>
            </div>
            <div className="space-y-4 p-6 group">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors duration-500 border border-secondary/20">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{tx.pillarsTitle2}</h3>
              <p className="text-muted-foreground leading-relaxed">{tx.pillarsDesc2}</p>
            </div>
            <div className="space-y-4 p-6 group">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-500 border border-accent/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{tx.pillarsTitle3}</h3>
              <p className="text-muted-foreground leading-relaxed">{tx.pillarsDesc3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-32 px-6 bg-background relative">
        <div className="flex items-center justify-center gap-6 max-w-sm mx-auto mb-12 opacity-75">
          <div className="h-[2px] bg-gradient-to-r from-transparent to-[#C5A880] flex-1" />
            <div className="w-4 h-4 rotate-45 border-2 border-[#C5A880] bg-[#C5A880]/10 flex items-center justify-center" />
              <div className="w-6 h-6 rotate-45 border-2 border-[#C5A880] flex items-center justify-center bg-[#C5A880]/20">
                <div className="w-2 h-2 rotate-45 bg-[#C5A880]" />
                </div>
  <div className="w-4 h-4 rotate-45 border-2 border-[#C5A880] bg-[#C5A880]/10 flex items-center justify-center" />
  <div className="h-[2px] bg-gradient-to-l from-transparent to-[#C5A880] flex-1" />
</div>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="text-xl md:text-3xl font-serif italic text-foreground leading-tight text-balance">
            {tx.quote}
          </p>
          <div className="w-24 h-px bg-primary/40 mx-auto" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {tx.quoteBody}
          </p>
        </div>
      </section>

      {/* Waitlist Section */}
      <section
        id="waitlist"
        className="py-32 px-6 bg-card border-t border-border relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-md mx-auto relative z-10 bg-background/60 p-8 md:p-12 rounded-2xl border border-primary/20 backdrop-blur-md shadow-2xl">
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {tx.waitlistTitle}
            </h2>
            <p className="text-muted-foreground">{tx.waitlistBlurb}</p>
            {countData && (
              <p className="text-sm font-medium text-primary">
                {countData.count.toLocaleString()}{" "}
                {countData.count === 1 ? tx.waitlistCount1 : tx.waitlistCountN}
              </p>
            )}
          </div>

          {hasJoined ? (
            <div className="text-center space-y-4 p-8 rounded-xl bg-primary/10 border border-primary/20 animate-in zoom-in duration-500">
              <Sparkles className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-2xl font-serif text-foreground">{tx.successTitle}</h3>
              <p className="text-muted-foreground">{tx.successBody}</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          data-testid="input-name"
                          placeholder={tx.placeholderName}
                          className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                          {...field}
                          disabled={joinWaitlist.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          data-testid="input-email"
                          placeholder={tx.placeholderEmail}
                          className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                          {...field}
                          disabled={joinWaitlist.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CountryCombobox
                          value={field.value}
                          onChange={field.onChange}
                          disabled={joinWaitlist.isPending}
                          placeholder={tx.placeholderCountry}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  data-testid="button-submit-waitlist"
                  type="submit"
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
                  disabled={joinWaitlist.isPending}
                >
                  {joinWaitlist.isPending ? tx.submitPending : tx.submitIdle}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/thegameofhikma"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-instagram"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-card text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors duration-200 text-sm"
            >
              <Instagram className="w-4 h-4" />
              <span>@thegameofhikma</span>
            </a>
            <button
              data-testid="button-share"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: tx.shareTitle,
                    text: tx.shareText,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: tx.toastCopiedTitle, description: tx.toastCopiedDesc });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-card text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors duration-200 text-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{tx.footerShare}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-primary text-xs uppercase tracking-widest font-medium">{tx.footerDesign}</span>
              <span className="text-border">·</span>
              <span>Omar Abdel Nabi</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-primary text-xs uppercase tracking-widest font-medium">{tx.footerIllustration}</span>
              <span className="text-border">·</span>
              <span>Rania Gharaibeh</span>
            </div>
          </div>
          <p className="text-muted-foreground/50 text-xs">© {new Date().getFullYear()} {tx.footerCopy}</p>
        </div>
      </footer>
    </div>
  );
}
