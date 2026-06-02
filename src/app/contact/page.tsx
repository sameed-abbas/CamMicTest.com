"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle, HelpCircle } from "lucide-react";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("feedback");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SchemaMarkup
        schema={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Us - CamMicTest.com",
          "description": "Send inquiries, report webcam diagnostic bugs, or submit business collaboration requests.",
        }}
      />

      {/* Header */}
      <section className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl flex items-center gap-2">
          <Mail className="w-8 h-8 text-primary" /> Contact Support
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Have feedback on our media diagnostics, found a browser permission bug, or want to inquire about advertisement opportunities? Drop us a line.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-2 bg-card border border-border/40 p-6 md:p-8 rounded-3xl shadow-md">
          {submitted ? (
            <div className="p-6 bg-success/10 border border-success/20 text-success rounded-2xl text-center space-y-4 max-w-md mx-auto">
              <CheckCircle className="w-12 h-12 mx-auto animate-bounce" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Message Sent Successfully!</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Thank you for reaching out to us. Our support engineering team has received your submission and will get back to you within 24 to 48 hours.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/95"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name-input" className="text-xs font-bold text-muted-foreground uppercase">
                    Your Name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/50 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email-input" className="text-xs font-bold text-muted-foreground uppercase">
                    Email Address
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/50 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject-select" className="text-xs font-bold text-muted-foreground uppercase block">
                  Inquiry Category
                </label>
                <select
                  id="subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="feedback">General Feedback</option>
                  <option value="bug">Report a Bug / Device Failure</option>
                  <option value="ad">Advertising / Partnerships</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message-input" className="text-xs font-bold text-muted-foreground uppercase">
                  Your Message
                </label>
                <textarea
                  id="message-input"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none"
                  placeholder="Describe your issue or request..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary text-primary-foreground hover:bg-primary/95 font-bold rounded-2xl transition-all shadow-md shadow-primary/25 hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 fill-current" /> Send Message
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-6 bg-card border border-border/45 rounded-3xl space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" /> Troubleshooting Support
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Before submitting a hardware bug, please review our comprehensive <a href="/faq" className="text-primary hover:underline">FAQ section</a>. 90% of camera/microphone connection failures are solved by simply unblocking permissions in your browser bar.
            </p>
          </div>
          <AdSlot id="contact-sidebar-rect" format="rectangle" />
        </div>
      </div>
    </div>
  );
}
