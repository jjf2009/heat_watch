import { CheckCircle2, Award, TrendingUp, Zap, Shield, Users } from 'lucide-react';

export default function WhyUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">Why Choose HeatWatch?</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide the most accurate, comprehensive, and user-friendly urban heat island analysis platform available.
          </p>
        </div>
      </section>

      {/* Key Advantages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What Sets Us Apart</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {[
            {
              icon: <Award size={32} className="text-orange-600" />,
              title: 'Industry-Leading Accuracy',
              description: 'Our ML models achieve 95%+ accuracy using NASA satellite data combined with ground weather stations and advanced algorithms.',
            },
            {
              icon: <Zap size={32} className="text-orange-600" />,
              title: 'Real-time Updates',
              description: 'Get instant alerts and data updates with our live satellite integration and weather API connections.',
            },
            {
              icon: <TrendingUp size={32} className="text-orange-600" />,
              title: 'Predictive Analytics',
              description: 'Forecast heat patterns and peak hours with our advanced regression models and neural networks.',
            },
            {
              icon: <Shield size={32} className="text-orange-600" />,
              title: 'Actionable Insights',
              description: 'Receive AI-powered recommendations specifically designed to reduce UHI intensity in your city.',
            },
            {
              icon: <Users size={32} className="text-orange-600" />,
              title: 'Expert Support',
              description: 'Our climate scientists and engineers are available to help you implement and optimize solutions.',
            },
            {
              icon: <CheckCircle2 size={32} className="text-orange-600" />,
              title: 'Global Standard',
              description: 'Used by leading cities worldwide and built on peer-reviewed climate science research.',
            },
          ].map((advantage, i) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="mb-4">{advantage.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{advantage.title}</h3>
              <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How We Compare</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-orange-600">
                  <th className="px-6 py-4 text-left font-bold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center font-bold text-orange-600">HeatWatch</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-500">Generic GIS Tools</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-500">Satellite Services</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Real-time UHI Analysis', heatwatch: true, gis: false, satellite: false },
                  { feature: 'ML-powered Risk Scoring', heatwatch: true, gis: false, satellite: false },
                  { feature: 'Peak Hour Predictions', heatwatch: true, gis: false, satellite: false },
                  { feature: 'Intervention Simulator', heatwatch: true, gis: false, satellite: false },
                  { feature: 'NASA Satellite Integration', heatwatch: true, gis: false, satellite: true },
                  { feature: 'Weather Data Fusion', heatwatch: true, gis: true, satellite: true },
                  { feature: 'AI Recommendations', heatwatch: true, gis: false, satellite: false },
                  { feature: 'Easy-to-use Interface', heatwatch: true, gis: false, satellite: false },
                  { feature: 'Affordable Pricing', heatwatch: true, gis: true, satellite: false },
                  { feature: 'Priority Support', heatwatch: true, gis: false, satellite: false },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-gray-200 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.heatwatch ? (
                        <CheckCircle2 size={24} className="text-green-500 mx-auto" />
                      ) : (
                        <div className="w-6 h-6 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.gis ? (
                        <CheckCircle2 size={24} className="text-green-500 mx-auto" />
                      ) : (
                        <div className="w-6 h-6 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.satellite ? (
                        <CheckCircle2 size={24} className="text-green-500 mx-auto" />
                      ) : (
                        <div className="w-6 h-6 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              city: 'San Francisco, CA',
              metric: 'Reduced UHI by 2.3°C',
              quote: 'HeatWatch helped us identify critical heat zones and implement targeted cooling strategies.',
            },
            {
              city: 'Austin, TX',
              metric: '15% less urban heat',
              quote: 'The intervention simulator allowed us to test solutions before expensive implementation.',
            },
            {
              city: 'Singapore',
              metric: '25% energy savings',
              quote: 'Real-time monitoring helps us make data-driven decisions for public health.',
            },
          ].map((story, i) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <p className="text-sm text-orange-600 font-semibold mb-2">✓ {story.metric}</p>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{story.city}</h3>
              <p className="text-gray-600 italic">&quot;{story.quote}&quot;</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Experience the Difference</h2>
          <p className="text-lg text-orange-100 mb-8">
            Join leading cities in understanding and managing urban heat islands
          </p>
          <button className="px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-lg hover:text-orange-700">
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}
