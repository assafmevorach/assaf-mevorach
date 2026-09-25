import Image from "next/image";
import Reveal from "../components/Reveal";

/* ---------------------------------- data ---------------------------------- */

const NAV = [
  { label: "About", href: "#about" },
  { label: "Career", href: "#career" },
  { label: "Innovations", href: "#innovations" },
  { label: "Projects", href: "#projects" },
  { label: "Community", href: "#community" },
  { label: "Contact", href: "#contact" },
];

const TIMELINE = [
  {
    period: "2024 to Present",
    title: "Director of Business Strategy & Software Solutions",
    detail: "Intel Client Connectivity, Hillsboro, Oregon",
  },
  {
    period: "2024",
    title: "Strategic Marketing Director",
    detail: "Intel",
  },
  {
    period: "Thunderbolt era",
    title: "Director of Strategic Marketing, Thunderbolt & USB4",
    detail: "Led product and ecosystem strategy for Thunderbolt and USB4; created and launched Thunderbolt Share",
  },
  {
    period: "Connectivity era",
    title: "Director of Engineering, Wi-Fi / IoT",
    detail: "Led engineering teams across Wi-Fi and smart-home solutions",
  },
  {
    period: "2011",
    title: "Moved to Hillsboro, Oregon",
    detail: "Continued the Intel journey from Haifa to the Pacific Northwest",
  },
  {
    period: "2000",
    title: "Joined Intel, Haifa, Israel",
    detail: "Started on VTune binary instrumentation",
  },
];

const PATENTS = [
  {
    number: "US 10,075,836",
    title: "Device group management",
    href: "https://patents.google.com/patent/US10075836B2/en",
  },
  {
    number: "US 10,700,791",
    title: "Ultrasonic device onboarding",
    href: "https://patents.google.com/patent/US10700791B2/en",
  },
];

/* --------------------------------- pieces --------------------------------- */

function LinkedInIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
    </svg>
  );
}

function GitHubIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.38.82 1.11.82 2.24v3.32c0 .32.21.7.82.58A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function SoundCloudIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z" />
    </svg>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-glow">
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-4 font-display text-4xl leading-tight text-cream md:text-5xl">
      {children}
    </h2>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function Home() {
  return (
    <>
      {/* navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-ink/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-display text-xl tracking-wide text-cream">
            AM<span className="text-glow">.</span>
          </a>
          <div className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-sand transition-colors hover:text-glow"
              >
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="https://www.linkedin.com/in/assafm"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-glow/40 px-4 py-2 text-sm text-glow transition-colors hover:bg-glow hover:text-ink"
          >
            <LinkedInIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Connect</span>
          </a>
        </nav>
      </header>

      <main id="top">
        {/* hero */}
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-glow/10 blur-[120px]"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-[1.2fr_0.8fr]">
            <Reveal>
              <Eyebrow>Portland, Oregon</Eyebrow>
              <h1 className="mt-6 font-display text-6xl leading-[1.02] text-cream md:text-8xl">
                Assaf
                <br />
                Mevorach
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-sand">
                Director of Business Strategy &amp; Software Solutions at Intel.
                Twenty-six years in product management and software engineering
                leadership across Thunderbolt, USB4, Wi-Fi, and connectivity.
              </p>
              <p className="mt-6 max-w-xl font-display text-2xl italic leading-snug text-cream/90">
                “I turn deep technology into products people love.”
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="https://www.linkedin.com/in/assafm"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-glow px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
                >
                  <LinkedInIcon className="h-4 w-4" />
                  LinkedIn
                </a>
                <a
                  href="/files/Assaf-Mevorach-Resume.pdf"
                  className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-glow hover:text-glow"
                >
                  <DownloadIcon className="h-4 w-4" />
                  R&#233;sum&#233;
                </a>
                <a
                  href="https://github.com/assafmevorach"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-glow hover:text-glow"
                >
                  <GitHubIcon className="h-4 w-4" />
                  GitHub
                </a>
              </div>
            </Reveal>
            <Reveal delay={150} className="justify-self-center md:justify-self-end">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-[2rem] border border-glow/30"
                />
                <Image
                  src="/photos/headshot.jpg"
                  alt="Portrait of Assaf Mevorach"
                  width={800}
                  height={800}
                  priority
                  className="h-72 w-72 rounded-[1.75rem] object-cover md:h-96 md:w-96"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* about */}
        <section id="about" className="scroll-mt-24 border-t border-white/5 bg-coal/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <Eyebrow>About</Eyebrow>
              <SectionTitle>A builder at the intersection of technology and product</SectionTitle>
            </Reveal>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              <Reveal delay={100}>
                <p className="text-lg leading-relaxed text-cream/85">
                  I am a product management and software engineering leader,
                  26 years at Intel. I take deep technology and turn it into
                  products: Thunderbolt, Wi-Fi, smart home. I work directly
                  with engineers, designers, and researchers, and I stay close
                  to the details.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-lg leading-relaxed text-cream/85">
                  The work I am proudest of: creating Thunderbolt Share and
                  taking it from concept to market launch, a first-of-its-kind
                  product and a CES 2025 Innovation Award Honoree. I ship.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* career */}
        <section id="career" className="scroll-mt-24 border-t border-white/5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <Eyebrow>Career</Eyebrow>
              <SectionTitle>Twenty-six years at Intel</SectionTitle>
              <p className="mt-6 max-w-2xl text-sand">
                VTune binary instrumentation in Haifa, 2000. Business strategy
                in Hillsboro, 2024. The throughline: go deep on the technology,
                then carry it to market.
              </p>
            </Reveal>
            <ol className="mt-14 space-y-0">
              {TIMELINE.map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 60}>
                  <div className="group grid gap-2 border-t border-white/10 py-7 transition-colors last:border-b hover:border-glow/40 md:grid-cols-[220px_1fr] md:gap-8">
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-glow">
                      {item.period}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl text-cream">{item.title}</h3>
                      <p className="mt-2 text-sand">{item.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* innovations */}
        <section id="innovations" className="scroll-mt-24 border-t border-white/5 bg-coal/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <Eyebrow>Innovations</Eyebrow>
              <SectionTitle>First-of-their-kind products</SectionTitle>
            </Reveal>

            <Reveal delay={100}>
              <article className="relative mt-12 overflow-hidden rounded-3xl border border-glow/25 bg-gradient-to-br from-coal to-ink p-8 md:p-12">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-glow/15 blur-[100px]"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-glow px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ink">
                    CES 2025 Innovation Award Honoree
                  </span>
                  <span className="text-sm text-sand">Launched May 15, 2024</span>
                </div>
                <h3 className="mt-6 font-display text-4xl text-cream md:text-5xl">
                  Thunderbolt Share
                </h3>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-cream/85">
                  Creator, inventor, and product owner. Concept to market
                  launch. Thunderbolt Share lets two PCs share screens, keyboard,
                  mouse, and files over one Thunderbolt cable: a new category of
                  PC-to-PC computing, built on the Thunderbolt ecosystem I
                  helped grow.
                </p>
              </article>
            </Reveal>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {PATENTS.map((patent, i) => (
                <Reveal key={patent.number} delay={i * 80}>
                  <a
                    href={patent.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group block h-full rounded-2xl border border-white/10 bg-ink p-7 transition-colors hover:border-glow/40"
                  >
                    <Eyebrow>US Patent</Eyebrow>
                    <h3 className="mt-3 font-display text-2xl text-cream">{patent.number}</h3>
                    <p className="mt-2 text-sand">{patent.title}</p>
                    <p className="mt-4 flex items-center gap-1.5 text-sm text-sand/70 transition-colors group-hover:text-glow">
                      Named inventor <span aria-hidden="true">&middot;</span> View on Google Patents
                      <ArrowIcon className="h-3.5 w-3.5" />
                    </p>
                  </a>
                </Reveal>
              ))}
              <Reveal delay={160}>
                <article className="h-full rounded-2xl border border-white/10 bg-ink p-7 transition-colors hover:border-glow/40">
                  <Eyebrow>Standards</Eyebrow>
                  <h3 className="mt-3 font-display text-2xl text-cream">USB4</h3>
                  <p className="mt-2 text-sand">
                    Acknowledged contributor to the USB4 specification (IEC 62680-4-1)
                  </p>
                  <p className="mt-4 text-sm text-sand/70">Industry specification</p>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* projects */}
        <section id="projects" className="scroll-mt-24 border-t border-white/5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <Eyebrow>Side Projects</Eyebrow>
              <SectionTitle>Built beyond the day job</SectionTitle>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Reveal delay={80}>
                <a
                  href="https://gocasepilot.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="group block h-full rounded-2xl border border-white/10 bg-coal/40 p-8 transition-all hover:-translate-y-1 hover:border-glow/40"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-3xl text-cream">CasePilot</h3>
                    <ArrowIcon className="h-5 w-5 text-sand transition-all group-hover:translate-x-0.5 group-hover:text-glow" />
                  </div>
                  <p className="mt-4 leading-relaxed text-sand">
                    A verified case wiki. Structured, trustworthy case knowledge,
                    productized for the people who need it.
                  </p>
                </a>
              </Reveal>
              <Reveal delay={160}>
                <article className="h-full rounded-2xl border border-white/10 bg-coal/40 p-8">
                  <h3 className="font-display text-3xl text-cream">Portland Divorce Directory</h3>
                  <p className="mt-4 leading-relaxed text-sand">
                    A local directory connecting people with vetted divorce
                    professionals across the Portland area.
                  </p>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* community */}
        <section id="community" className="scroll-mt-24 border-t border-white/5 bg-coal/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <Eyebrow>Community & Culture</Eyebrow>
              <SectionTitle>Showing up for Portland</SectionTitle>
            </Reveal>
            <Reveal delay={100}>
              <figure className="mt-12 overflow-hidden rounded-3xl border border-white/10">
                <Image
                  src="/photos/hanukkah-rave.jpg"
                  alt="Assaf Mevorach hanging a sign at the Portland Hanukkah Rave"
                  width={1440}
                  height={960}
                  className="aspect-[3/2] w-full object-cover"
                />
                <figcaption className="flex flex-wrap items-baseline justify-between gap-2 bg-ink px-6 py-4">
                  <span className="text-sm text-sand">
                    Hanging the “In a world full of darkness, be a light” sign at the Portland Hanukkah Rave
                  </span>
                  <span className="text-xs text-sand/60">Photo: Eli Imadali / OPB</span>
                </figcaption>
              </figure>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Reveal delay={80}>
                <div className="rounded-2xl border border-white/10 bg-ink p-7">
                  <h3 className="font-display text-xl text-cream">ATS Portland Chair</h3>
                  <p className="mt-3 text-sand">
                    Alumni chair of the American Technion Society’s Portland chapter.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={140}>
                <div className="rounded-2xl border border-white/10 bg-ink p-7">
                  <h3 className="font-display text-xl text-cream">Guest Lecturer</h3>
                  <p className="mt-3 text-sand">
                    Twice invited to guest-lecture at Portland State University.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="rounded-2xl border border-white/10 bg-ink p-7">
                  <h3 className="font-display text-xl text-cream">Party Promoter</h3>
                  <p className="mt-3 text-sand">
                    Organizer of Portland&#8217;s Halloween, Hanukkah, and Purim dance
                    parties. Interviewed on OPB&#8217;s <em>All Things Considered</em>.
                  </p>
                </div>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <div className="mt-10 rounded-2xl border border-white/10 bg-ink p-7">
                <h3 className="font-display text-xl text-cream">Writing</h3>
                <p className="mt-3 text-sand">
                  I write on Substack about AI orchestration and product
                  development: how agentic systems change the way we build.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* contact */}
        <section id="contact" className="scroll-mt-24 border-t border-white/5 py-24 md:py-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Reveal>
              <Eyebrow>Contact</Eyebrow>
              <h2 className="mt-4 font-display text-5xl leading-tight text-cream md:text-6xl">
                Let’s build something
                <br />
                remarkable.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-sand">
                I like talking to people building real things.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-sand">
                My LinkedIn profile carries an open-to-work badge for recruiters.
                If you are hiring senior product leadership in deep tech,
                semiconductors, or connectivity, I would like to hear from you.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a
                  href="https://www.linkedin.com/in/assafm"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-glow px-8 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
                >
                  <LinkedInIcon className="h-4 w-4" />
                  LinkedIn
                </a>
                <a
                  href="/files/Assaf-Mevorach-Resume.pdf"
                  className="flex items-center gap-2 rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-glow hover:text-glow"
                >
                  <DownloadIcon className="h-4 w-4" />
                  R&#233;sum&#233;
                </a>
                <a
                  href="https://github.com/assafmevorach"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-glow hover:text-glow"
                >
                  <GitHubIcon className="h-4 w-4" />
                  GitHub
                </a>
                <a
                  href="https://soundcloud.com/assaf-mevorach"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-glow hover:text-glow"
                >
                  <SoundCloudIcon className="h-4 w-4" />
                  SoundCloud
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-sand/70">
          <span>&#169; 2026 Assaf Mevorach</span>
          <div className="flex items-center gap-5">
            <a
              href="https://www.linkedin.com/in/assafm"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-sand/70 transition-colors hover:text-glow"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/assafmevorach"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-sand/70 transition-colors hover:text-glow"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
            <a
              href="https://soundcloud.com/assaf-mevorach"
              target="_blank"
              rel="noreferrer"
              aria-label="SoundCloud"
              className="text-sand/70 transition-colors hover:text-glow"
            >
              <SoundCloudIcon className="h-5 w-5" />
            </a>
          </div>
          <span>Portland, Oregon</span>
        </div>
      </footer>
    </>
  );
}
