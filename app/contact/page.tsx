'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', company: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Badge variant="info" className="mb-4">Contact Us</Badge>
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-[var(--foreground)]">Get in Touch</h1>
        <p className="text-xl text-[var(--text-muted)] max-w-3xl mx-auto">
          Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
        </p>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {[
              {
                icon: Mail,
                title: 'Email',
                content: 'support@heatwatch.com',
                desc: 'We typically respond within 24 hours',
              },
              {
                icon: Phone,
                title: 'Phone',
                content: '+1 (555) 123-4567',
                desc: 'Available during business hours',
              },
              {
                icon: MapPin,
                title: 'Office',
                content: 'San Francisco, CA',
                desc: 'Headquarters & research center',
              },
            ].map((item, i) => (
              <Card key={i} hover>
                <CardHeader>
                  <item.icon size={32} className="text-[var(--accent-fire)] mb-2" />
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--foreground)] font-semibold mb-1">{item.content}</p>
                  <p className="text-[var(--text-muted)] text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-semibold text-[var(--foreground)] mb-2">Thank you!</h3>
                      <p className="text-[var(--text-muted)]">
                        We&apos;ve received your message and will get back to you soon.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Name
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Company (Optional)
                      </label>
                      <Input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your organization"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help..."
                        rows={6}
                        className="w-full px-4 py-2.5 rounded-md bg-[var(--surface-light)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--text-muted)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-fire)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full group">
                      Send Message
                      <Send size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support Info */}
      <section className="py-20 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-12 text-center">
            Response Times by Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                plan: 'Free',
                response: '72 hours',
                support: 'Community forums & knowledge base',
              },
              {
                plan: 'Professional',
                response: '24 hours',
                support: 'Email support from our team',
              },
              {
                plan: 'Enterprise',
                response: '4 hours',
                support: 'Priority phone & Slack support',
              },
            ].map((item, i) => (
              <Card key={i} hover className={i === 1 ? 'border-[var(--accent-fire)]' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.plan}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-[var(--text-muted)] text-sm">Response Time</p>
                    <p className="text-2xl font-bold text-[var(--accent-fire)]">{item.response}</p>
                  </div>
                  <p className="text-[var(--foreground)]">{item.support}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
