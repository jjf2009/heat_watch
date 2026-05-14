'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

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
    // Simulate form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', company: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            {[
              {
                icon: <Mail size={32} className="text-orange-600" />,
                title: 'Email',
                content: 'support@heatwatch.com',
                href: 'mailto:support@heatwatch.com',
              },
              {
                icon: <Phone size={32} className="text-orange-600" />,
                title: 'Phone',
                content: '+1 (555) 123-4567',
                href: 'tel:+15551234567',
              },
              {
                icon: <MapPin size={32} className="text-orange-600" />,
                title: 'Office',
                content: 'San Francisco, CA, USA',
                href: '#',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <a href={item.href} className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                  {item.content}
                </a>
              </div>
            ))}

            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-6 border border-orange-200">
              <h4 className="font-bold text-gray-900 mb-2">Response Time</h4>
              <p className="text-gray-700 text-sm">
                We typically respond to inquiries within <strong>24 hours</strong> on business days.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✓ Thank you! We've received your message and will be in touch soon.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="City Planning Department"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us how we can help..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Send size={20} /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { metric: '24/7', label: 'Platform Availability' },
              { metric: '50+', label: 'Cities Monitored' },
              { metric: '<1min', label: 'Average Response Time' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-orange-600 mb-2">{item.metric}</p>
                <p className="text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
