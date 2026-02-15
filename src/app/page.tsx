'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, onboardingComplete } = useApp();
  const ctaHref = isAuthenticated && onboardingComplete ? '/dashboard' : '/onboarding';
  const ctaLabel = isAuthenticated && onboardingComplete ? 'Go to Dashboard' : 'Get Started Free';

  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const reveal = (delay: number) => ({
    opacity: ready ? 1 : 0,
    transform: ready ? 'translateY(0)' : 'translateY(12px)',
    transition: `all 0.5s cubic-bezier(.25,.46,.45,.94) ${delay}ms`,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-5" style={reveal(100)}>
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <span className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center text-sm font-extrabold">D</span>
          <span className="font-bold tracking-tight text-lg">DreamPath</span>
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthenticated && onboardingComplete ? (
            <Link href="/dashboard">
              <Button size="sm" className="rounded-full gap-1.5 cursor-pointer">Dashboard <ArrowUpRight className="h-3.5 w-3.5" /></Button>
            </Link>
          ) : (
            <>
              <Link href="/onboarding"><Button variant="ghost" size="sm" className="cursor-pointer">Log in</Button></Link>
              <Link href="/onboarding"><Button size="sm" className="rounded-full gap-1.5 cursor-pointer">Get Started <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="px-6 lg:px-12 pt-16 sm:pt-24 pb-20 sm:pb-28 max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-5" style={reveal(200)}>
          Career guidance for class 8 – 12
        </p>

        <h1 className="text-display max-w-2xl mb-5" style={reveal(300)}>
          Figure out your career before you pick a stream.
        </h1>

        <p className="text-lg leading-relaxed text-muted-foreground max-w-lg mb-8" style={reveal(400)}>
          Explore 100+ career paths with real data. Get a personalized roadmap.
          Track your progress — all guided by AI.
        </p>

        <div className="flex flex-wrap gap-3 mb-14" style={reveal(500)}>
          <Link href={ctaHref}>
            <Button size="lg" className="rounded-full h-11 px-6 gap-2 font-semibold cursor-pointer group">
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/careers">
            <Button variant="outline" size="lg" className="rounded-full h-11 px-6 font-semibold cursor-pointer">
              Browse Careers
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-10 text-sm" style={reveal(600)}>
          {[
            ['100+', 'Career paths'],
            ['10k+', 'Students'],
            ['Class 8–12', 'Age range'],
          ].map(([val, label]) => (
            <div key={label}>
              <div className="text-xl font-extrabold tracking-tight">{val}</div>
              <div className="text-muted-foreground text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t">
        <div className="px-6 lg:px-12 py-16 sm:py-20 ">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">How it works</p>
          <h2 className="text-heading max-w-sm mb-12">Four steps from confusion to clarity.</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border">
            {[
              { n: '01', t: 'Discover', d: 'Browse careers with salaries, entrance exams, and growth data.' },
              { n: '02', t: 'Plan', d: 'Get a roadmap matched to your stream and interests.' },
              { n: '03', t: 'Learn', d: 'Chat with an AI guide that adapts to your profile.' },
              { n: '04', t: 'Achieve', d: 'Build streaks, earn badges, track every step.' },
            ].map((s) => (
              <div key={s.n} className="bg-card p-6 hover:bg-muted/50 transition-colors cursor-default">
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground">{s.n}</span>
                <h3 className="text-lg font-bold mt-3 mb-1.5">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="mx-6 lg:mx-12 mb-12 rounded-xl overflow-hidden bg-foreground">
        <div className="px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-background">Ready to plan your future?</h2>
            <p className="text-sm text-background/60 mt-1">Takes 3 minutes. Free forever.</p>
          </div>
          <Link href={ctaHref}>
            <Button size="lg" className="rounded-full h-11 px-6 font-semibold gap-2 bg-background text-foreground hover:bg-background/90 cursor-pointer group whitespace-nowrap">
              {ctaLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-6 lg:px-12 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded bg-foreground text-background grid place-items-center text-[9px] font-extrabold">D</span>
            <span className="font-semibold text-foreground">DreamPath</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-5 font-medium">
            <a href="#privacy" className="hover:text-foreground transition-colors cursor-pointer">Privacy</a>
            <a href="#terms" className="hover:text-foreground transition-colors cursor-pointer">Terms</a>
            <a href="#contact" className="hover:text-foreground transition-colors cursor-pointer">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
