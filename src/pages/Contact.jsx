export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">📬</p>
          <h1 className="text-2xl font-bold text-gray-800">Contact Us</h1>
          <p className="text-gray-400 text-sm mt-1">We'd love to hear from you</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[['📧', 'Email', 'support@easycart.in'],['📞', 'Phone', '+91 98765 43210'],['🕐', 'Hours', 'Mon–Sat, 9am–6pm']].map(([icon, label, value]) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-xs text-gray-400 font-semibold">{label}</p>
              <p className="text-sm text-gray-700 font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-gray-800 mb-4">Send a Message</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 font-medium">Name</label>
              <input placeholder="Your name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Email</label>
              <input placeholder="you@example.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 font-medium">Message</label>
            <textarea rows={4} placeholder="How can we help?" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400 resize-none" />
          </div>
          <button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-2.5 rounded-xl transition-colors">Send Message →</button>
        </div>
      </div>
    </div>
  )
}
