import { Users, Lightbulb, Target, Rocket } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">About HeatWatch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to help cities around the world understand and combat the urban heat island effect through advanced AI and satellite technology.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Target size={40} className="text-orange-600" />,
              title: 'Our Mission',
              description: 'Empower city planners and climate authorities with real-time, data-driven insights to create cooler, more livable urban spaces.',
            },
            {
              icon: <Lightbulb size={40} className="text-orange-600" />,
              title: 'Our Vision',
              description: 'A world where urban heat islands are understood, monitored, and managed through intelligent technology and collaboration.',
            },
            {
              icon: <Rocket size={40} className="text-orange-600" />,
              title: 'Our Impact',
              description: 'Helping reduce urban temperatures by 2-3°C through evidence-based intervention recommendations.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Technology</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced AI & ML</h3>
              <ul className="space-y-4">
                {[
                  'Neural Networks (ONNX) for pattern recognition',
                  'Regression forecasting for temperature trends',
                  'Risk scoring algorithms for UHI assessment',
                  'Real-time data fusion from multiple sources',
                  'Intervention impact simulations',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🤖📡🛰️</div>
              <p className="text-gray-700 font-semibold">Machine Learning + Satellite Data + Real-time Integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Team</h2>
        <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-100">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users size={32} className="text-orange-600" />
            <h3 className="text-2xl font-bold text-gray-900">Built by Climate Tech Experts</h3>
          </div>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8 leading-relaxed">
            Our team consists of climate scientists, machine learning engineers, and urban planners with decades of combined experience in environmental monitoring, satellite imagery analysis, and sustainable city development. We're passionate about using technology to solve real-world climate challenges.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'CTO', description: 'ML & Satellite Data Expert' },
              { role: 'Lead Climate Scientist', description: 'UHI Research Specialist' },
              { role: 'Product Lead', description: 'Urban Planning Background' },
            ].map((member, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                <div className="w-16 h-16 bg-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl">
                  {i === 0 ? '👨‍💻' : i === 1 ? '👨‍🔬' : '👩‍🏫'}
                </div>
                <p className="font-bold text-gray-900 mb-1">{member.role}</p>
                <p className="text-sm text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '50+', label: 'Cities Monitored' },
              { number: '1M+', label: 'Data Points/Day' },
              { number: '99.9%', label: 'Uptime' },
              { number: '2.5°C', label: 'Avg. Temperature Reduction' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-bold mb-2">{stat.number}</p>
                <p className="text-orange-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
