export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-10 md:py-12">
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-4">
        Contact
      </h1>
      <p className="text-sm text-slate-700 mb-4">
        Use this form to reach out regarding speaking, collaborations, or general
        inquiries.
      </p>
      <form className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] mb-1">
            Name
          </label>
          <input
            type="text"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] mb-1">
            Message
          </label>
          <textarea
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm min-h-[120px]"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold border border-black/70 bg-black/80 text-white rounded-full hover:bg-black/60 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
