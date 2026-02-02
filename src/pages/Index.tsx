"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, SmilePlus, BarChart3, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="px-6 py-12 md:py-24 max-w-7xl mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-8">
          <Heart className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
          Your path to <span className="text-primary">Mental Wellness</span> starts here.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          MindEase provides empathetic support through CBT-guided conversations, mood tracking, and progress insights.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-full btn-calm text-lg">
            <Link to="/signup">Get Started for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-8 rounded-full btn-calm text-lg">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-muted/30 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-16">Designed for your well-being</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 card-calm">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">AI Support Chat</h3>
              <p className="text-muted-foreground">
                Engage in meaningful conversations with our empathetic AI companion trained in CBT techniques.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 card-calm">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6">
                <SmilePlus className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-3">Mood Tracking</h3>
              <p className="text-muted-foreground">
                Log your daily feelings and identify patterns that affect your mental state over time.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 card-calm">
              <div className="w-12 h-12 rounded-xl bg-success/30 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-success-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-3">Progress Insights</h3>
              <p className="text-muted-foreground">
                Visualize your wellness journey with detailed charts and celebrate your personal milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <footer className="py-20 px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">Your privacy is our priority</span>
        </div>
        <p className="text-muted-foreground mb-8">
          MindEase uses secure, encrypted storage. Your data and conversations remain private and under your control.
        </p>
        <div className="pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MindEase Support Hub. Built for mental wellness.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;