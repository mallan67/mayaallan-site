import Link from "next/link";

type BookStatus = "DRAFT" | "COMING_SOON" | "PUBLISHED";

type MainBook = {
  title: string;
  subtitle: string;
  author: string;
  taglineLines: string[];
  status: BookStatus;
  releaseDate?: string;
  shortBlurb: string;
  isPreorder?: boolean;
};

// For now this is static. Later you can replace this with a Prisma call
// to fetch the main book from the database.
const mainBook: MainBook = {
  title: "Guide to Psilocybin Integration",
  subtitle: "40 Real Scenarios for Navigating What You See, Feel & Experience",
  author: "MAYA ALLAN",
  taglineLines: [
    "Rewire Your Mind • Release Fears • Heal Traumas",
    "Inner Freedom • Self-Agency • Awakening • Transformation",
  ],
  status: "COMING_SOON",
  releaseDate: "December 2025",
  shortBlurb:
    "An educational companion for integrating psychedelic experiences into day-to-day life through real-world scenarios, reflection, and grounded inquiry.",
  isPreorder: false,
};

const articles: never[] = [];
const events: never[] = [];
const mediaItems: never[] = [];

const hasArticles = articles.length > 0;
const hasEvents = events.length > 0;
const hasMedia = mediaItems.length > 0;

export default function HomePage() {
  return (
    <div className="pb-10">
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center md:justify-start">
          <div className="w-48 md:w-64 aspect-[2/3] border border-slate-200 shadow-md rounded-md flex items-center justify-center bg-slate-50">
            <div className="text-center px-4">
              <div className="font-serif font-semibold text-sm tracking-wide uppercase">
                Book Cover
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Placeholder – upload real cover later.
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">
            New Release
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            {mainBook.title}
          </h1>
          <p className="mt-3 font-serif text-base md:text-lg text-slate-700">
            {mainBook.subtitle}
          </p>

          <div className="mt-4 text-sm text-slate-600 space-y-1">
            {mainBook.taglineLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">
            By {mainBook.author}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 items-center">
            {mainBook.status === "COMING_SOON" ? (
              <>
                <span className="px-5 py-2.5 text-sm font-semibold border border-black/70 bg-black/80 text-white rounded-full">
                  Coming Soon
                </span>
                {mainBook.releaseDate && (
                  <span className="text-xs text-slate-600">
                    Releases {mainBook.releaseDate}
                  </span>
                )}
              </>
            ) : (
              <>
                <a
                  href="#"
                  className="px-5 py-2.5 text-sm font-semibold border border-black/70 bg-black/80 text-white rounded-full hover:bg-black/60 transition"
                >
                  {mainBook.isPreorder ? "Pre-order on Amazon" : "Buy on Amazon"}
                </a>
                <a
                  href="#"
                  className="px-5 py-2.5 text-sm font-semibold border border-slate-900/20 bg-slate-900/5 rounded-full hover:bg-slate-900/10 transition"
                >
                  {mainBook.isPreorder ? "Pre-order on Lulu" : "Buy on Lulu"}
                </a>
              </>
            )}
          </div>

          <p className="mt-3 text-xs text-slate-500 max-w-md">
            Formats such as ebook, print, or audio may be available depending on
            the retailer and your region.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
          <h2 className="font-serif text-xl md:text-2xl font-semibold mb-4">
            About the Book
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-slate-700">
            {mainBook.shortBlurb}
          </p>
        </div>
      </section>

      {hasArticles && (
        <section className="border-t border-slate-200" id="articles">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl md:text-2xl font-semibold">
                Articles
              </h2>
              <Link
                href="/articles"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:opacity-70"
              >
                View all
              </Link>
            </div>
          </div>
        </section>
      )}

      {hasEvents && (
        <section className="border-t border-slate-200" id="events">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl md:text-2xl font-semibold">
                Events
              </h2>
              <Link
                href="/events"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:opacity-70"
              >
                View all
              </Link>
            </div>
          </div>
        </section>
      )}

      {hasMedia && (
        <section className="border-t border-slate-200" id="media">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl md:text-2xl font-semibold">
                Media – Music, Guides &amp; Videos
              </h2>
              <Link
                href="/media"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:opacity-70"
              >
                View all
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-slate-200" id="about">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12 grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] gap-8 items-start">
          <div className="flex justify-center md:justify-start">
            <div className="w-32 h-32 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500">
              Author Photo
            </div>
          </div>
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-semibold mb-3">
              About Maya Allan
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-700 mb-3">
              Maya Allan is an author focused on integration, self-agency, and
              inner transformation. Her work is strictly educational and
              reflective, helping readers think through their experiences
              without promising cures or outcomes.
            </p>
            <Link
              href="/about"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:opacity-70"
            >
              Read full bio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
