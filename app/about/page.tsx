import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Lightbulb, Target, Rocket, Globe, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Badge variant="info" className="mb-4">About Us</Badge>
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-[var(--foreground)]">About HeatWatch</h1>
        <p className="text-xl text-[var(--text-muted)] max-w-3xl mx-auto">
          We&apos;re on a mission to help cities around the world understand and combat the urban heat island effect through advanced AI and satellite technology.
        </p>
      </section>

      {/* Mission, Vision, Impact */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: 'Our Mission',
              description: 'Empower city planners and climate authorities with real-time, data-driven insights to create cooler, more livable urban spaces.',
            },
            {
              icon: Lightbulb,
              title: 'Our Vision',
              description: 'A world where urban heat islands are understood, monitored, and managed through intelligent technology and collaboration.',
            },
            {
              icon: Rocket,
              title: 'Our Impact',
              description: 'Helping reduce urban temperatures by 2-3°C through evidence-based intervention recommendations.',
            },
          ].map((item, i) => (
            <Card key={i} hover className="text-center">
              <CardHeader>
                <item.icon size={40} className="text-[var(--accent-fire)] mx-auto mb-2" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-muted)]">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-serif font-bold text-[var(--foreground)] mb-12 text-center">Our Technology</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-serif font-bold text-[var(--foreground)] mb-4">Machine Learning at Scale</h3>
              <p className="text-[var(--text-muted)] mb-4">
                Our proprietary neural networks analyze satellite imagery, weather patterns, and urban data to provide unprecedented accuracy in heat island prediction and analysis.
              </p>
              <ul className="space-y-3">
                {['ONNX Neural Networks', 'NASA Satellite Integration', 'Real-time Data Processing'].map((tech, i) => (
                  <li key={i} className="flex items-center gap-2 text-[var(--foreground)]">
                    <Zap size={18} className="text-[var(--accent-fire)]" />
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-gradient-to-br from-[var(--accent-fire)] to-[var(--accent-heat)] border-0">
              <CardContent className="p-12">
                <div className="text-center">
                  <Globe size={64} className="text-white mx-auto mb-4" />
                  <p className="text-white text-lg font-semibold">Global Coverage with Local Precision</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-serif font-bold text-[var(--foreground)] mb-12 text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              role: 'Climate Scientists & Data Engineers',
              count: '15+',
              desc: 'PhDs in atmospheric science, machine learning, and environmental engineering'
            },
            {
              role: 'Product & Design',
              count: '8+',
              desc: 'Building intuitive tools for complex climate data analysis'
            },
            {
              role: 'Government & NGO Partners',
              count: '50+',
              desc: 'Working with cities and organizations worldwide'
            },
            {
              role: 'Active Users',
              count: '50K+',
              desc: 'From planners to climate scientists, across 150+ countries'
            },
          ].map((item, i) => (
            <Card key={i} hover>
              <CardHeader>
                <CardTitle className="text-[var(--accent-fire)]">{item.count}</CardTitle>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{item.role}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-muted)]">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-serif font-bold text-[var(--foreground)] mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Data Integrity', desc: 'We trust only verified, peer-reviewed data sources' },
              { title: 'Open Science', desc: 'Our research is published and available to the scientific community' },
              { title: 'Climate Action', desc: 'Everything we build is in service of a cooler, more sustainable world' },
            ].map((value, i) => (
              <div key={i} className="p-6 border border-[var(--border)] rounded-lg hover:border-[var(--accent-fire)] transition-colors">
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{value.title}</h3>
                <p className="text-[var(--text-muted)]">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
