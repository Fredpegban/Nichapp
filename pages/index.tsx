import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Button from '../src/components/ui/Button';
import Card from '../src/components/ui/Card';
import SectionHeader from '../src/components/ui/SectionHeader';
import { useCurrentUser } from '../src/hooks/useCurrentUser';
import { featuredFounders } from '../src/lib/demoData';

const whyCards = [
  { icon: '✨', title: 'Story-first, not algorithm-first', body: 'Share authentic journeys without fighting opaque feeds.' },
  { icon: '🌍', title: 'Focused on Africa + UK niche brands', body: 'Built for regional context, cross-border collaboration, and community.' },
  { icon: '📈', title: 'Built for micro-founders, not big influencers', body: 'A platform tuned to early-stage traction, not vanity metrics.' },
  { icon: '💡', title: 'Designed for real journeys', body: 'Wins, setbacks, pivots—your full story has a home here.' },
];

const whoItems = [
  { title: 'Herbal & organic skincare founders', body: 'Share sourcing, routines, and results with believers.' },
  { title: 'Agro-export & food founders', body: 'Show farm-to-market stories and build trust across borders.' },
  { title: 'Wellness & handmade creators', body: 'Connect with supporters who value craft and care.' },
  { title: 'Micro-SaaS & digital tool builders', body: 'Ship in public, gather feedback, and grow your niche.' },
  { title: 'African-inspired lifestyle brands', body: 'Celebrate culture-forward products with a global audience.' },
];

const Home: NextPage = () => {
  const router = useRouter();
  const { user, logout } = useCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-lg font-semibold text-indigo-600">Nichapp</div>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-700">
            <Link className="hover:text-indigo-600" href="/feed">
              Feed
            </Link>
            <Link className="hover:text-indigo-600" href="/discover">
              Discover
            </Link>
            {user ? (
              <>
                <Link className="hover:text-indigo-600" href="/me/profile">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="text-indigo-600 hover:text-indigo-700"
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="hover:text-indigo-600" href="/auth/login">
                  Login
                </Link>
                <Link className="hover:text-indigo-600" href="/auth/register">
                  Join
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-amber-50 px-6 py-14 shadow-sm md:px-10 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
                Story-driven founder ecosystem
              </div>
              <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                Turn your niche story into visibility and community.
              </h1>
              <p className="text-lg text-slate-700 md:text-xl">
                Share authentic stories, grow visibility across Africa and the UK, and connect with supporters and fellow founders—all in one place.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => router.push('/auth/register')} size="lg">
                  Start your story
                </Button>
                <Button variant="secondary" onClick={() => router.push('/feed')} size="lg">
                  Discover stories
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 text-sm font-semibold text-slate-800">
                <div>
                  <div className="text-2xl text-emerald-600">98%</div>
                  <div className="text-xs font-normal text-slate-500">Founder satisfaction</div>
                </div>
                <div>
                  <div className="text-2xl text-orange-500">24h</div>
                  <div className="text-xs font-normal text-slate-500">Avg response</div>
                </div>
                <div>
                  <div className="text-2xl text-indigo-600">5K+</div>
                  <div className="text-xs font-normal text-slate-500">Supporters & peers</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-100/60 to-indigo-100/60 blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1400&q=80"
                  alt="Founders collaborating"
                  width={1400}
                  height={900}
                  className="h-full w-full object-cover"
                  priority
                />
                <div className="grid grid-cols-3 gap-4 bg-white/90 px-6 py-4 text-center text-sm font-semibold text-slate-900 md:text-base">
                  <div>
                    <div className="text-lg text-emerald-600">98%</div>
                    <div className="text-xs font-normal text-slate-500">Success rate</div>
                  </div>
                  <div>
                    <div className="text-lg text-orange-500">24h</div>
                    <div className="text-xs font-normal text-slate-500">Avg response</div>
                  </div>
                  <div>
                    <div className="text-lg text-indigo-600">5K+</div>
                    <div className="text-xs font-normal text-slate-500">Supporters</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Card className="mx-auto mt-2 max-w-6xl bg-slate-100 text-center text-sm text-slate-600">
          Built for herbal skincare brands, agro-exporters, wellness founders, makers, micro-SaaS builders, and more.
        </Card>

        <section className="py-14">
          <SectionHeader
            title="Why Nichapp exists"
            description="Major platforms drown niche founders in noise. Nichapp is designed as a home where your story doesn’t get lost."
            className="space-y-3"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {whyCards.map((card) => (
              <Card
                key={card.title}
                className="flex items-start gap-3"
              >
                <div className="text-lg">{card.icon}</div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{card.title}</h3>
                  <p className="mt-1 text-sm text-gray-700">{card.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-14">
          <SectionHeader title="Who Nichapp is for" className="space-y-3" />
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {whoItems.map((item) => (
              <Card
                key={item.title}
                className="transition hover:shadow-md"
              >
                <div className="text-sm font-semibold text-indigo-800">{item.title}</div>
                <p className="mt-2 text-sm text-gray-700">{item.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-14">
          <Card className="text-center">
            <blockquote className="text-2xl font-semibold text-gray-900">
              “Your story deserves to be seen. Nichapp is building the global home for niche entrepreneurship.”
            </blockquote>
            <p className="mt-3 text-sm text-slate-700">
              Launching with our 100 Founders Pilot across Africa and the UK.
            </p>
          </Card>
        </section>

        <section className="pb-14">
          <SectionHeader
            title="Featured founders"
            description="A glimpse into the journeys shared on Nichapp."
            className="mb-6"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {featuredFounders.map((founder) => (
              <Card
                key={founder._id}
                className="flex flex-col gap-4 border-slate-100 bg-white/90 shadow-md transition hover:-translate-y-1 hover:shadow-lg md:flex-row md:items-center"
              >
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-xl font-semibold text-indigo-700">
                  <Image
                    src={founder.avatarUrl}
                    alt={founder.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-lg font-semibold text-slate-900">
                    {founder.name} — {founder.brandName}
                  </div>
                  <div className="text-sm text-slate-600">
                    {founder.nicheName} · {founder.region}
                  </div>
                  <p className="text-sm text-slate-700">{founder.aboutFounder}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/founders/${founder._id}`)}
                  className="md:self-start"
                >
                  View profile
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-10 bg-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-indigo-700">Nichapp</div>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
            <Link className="hover:text-indigo-600" href="/feed">
              Feed
            </Link>
            <Link className="hover:text-indigo-600" href="/discover">
              Discover
            </Link>
            <Link className="hover:text-indigo-600" href="/me/profile">
              Profile
            </Link>
            <Link className="hover:text-indigo-600" href="/auth/login">
              Login
            </Link>
          </nav>
          <div className="text-xs text-slate-500">© 2025 Nichapp. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
