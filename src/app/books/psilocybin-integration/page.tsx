import React from "react";

export const metadata = {
  title: "Psilocybin Integration Guide",
  description: "Psilocybin Integration Guide — cover page with purchase links",
  openGraph: {
    title: "Psilocybin Integration Guide",
    description: "Psilocybin Integration Guide — cover page with purchase links",
    images: ["/images/cover.png"],
  },
};

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Psilocybin Integration Guide</h1>

      <div className="flex gap-6 items-start">
        <div>
          <img
            src="/images/cover.png"
            alt="Cover"
            width={360}
            height={540}
            className="rounded border"
          />
        </div>

        <div className="flex-1">
          <p className="mb-4">
            An educational companion for integrating psychedelic experiences into day-to-day
            life.
          </p>

          <div className="space-y-3">
            <a
              href="https://www.amazon.com/dp/EXAMPLE"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 bg-yellow-500 text-black rounded font-semibold"
            >
              Buy on Amazon
            </a>

            <a
              href="https://www.lulu.com/example"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 bg-gray-900 text-white rounded font-semibold"
            >
              Buy on Lulu
            </a>
          </div>

          <section className="mt-6 text-sm text-slate-600">
            <h3 className="font-semibold">About</h3>
            <p>
              This is a sample public cover page to make the product discoverable while the admin
              & DB are being prepared.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
