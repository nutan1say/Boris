import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Award, Crown, X } from 'lucide-react';
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/react';
import { fetchTopProfiles, upsertProfileFromClerk } from '@/lib/leaderboard';
import VideoBackdrop from '@/components/VideoBackdrop';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function LandingPage() {
  const { user, isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scores, setScores] = useState([]);
  const [boardLoading, setBoardLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBoard() {
      setBoardLoading(true);
      const rows = await fetchTopProfiles(10);
      if (!cancelled) {
        setScores(rows);
        setBoardLoading(false);
      }
    }

    loadBoard();
    const onFocus = () => {
      fetchTopProfiles(10).then((rows) => {
        if (!cancelled) setScores(rows);
      });
    };
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    upsertProfileFromClerk(user);
  }, [isSignedIn, user]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="bg-black font-inter text-white">
      {/* ── Hero (single viewport) ── */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <VideoBackdrop />

        <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16 lg:py-7">
          <span className="font-podium text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
            Boris
          </span>

          <nav className="hidden items-center gap-8 md:flex">
            <Show when="signed-in">
              <Link
                to="/play"
                className="font-inter text-sm uppercase tracking-widest text-white/80 transition hover:text-white"
              >
                Play
              </Link>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="font-inter text-sm uppercase tracking-widest text-white/80 transition hover:text-white"
                >
                  Play
                </button>
              </SignInButton>
            </Show>
            <a
              href="#leaderboard"
              className="font-inter text-sm uppercase tracking-widest text-white/80 transition hover:text-white"
            >
              Leaderboard
            </a>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="font-inter text-sm uppercase tracking-widest text-white/80 transition hover:text-white"
                >
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton afterSignOutUrl="/" />
            </Show>
          </nav>

          <div className="hidden md:block">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="group inline-flex items-center gap-2 border border-white/30 px-6 py-3 font-inter text-xs uppercase tracking-widest transition hover:border-white/60 hover:bg-white/10"
                >
                  Sign up
                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                to="/play"
                className="group inline-flex items-center gap-2 border border-white/30 px-6 py-3 font-inter text-xs uppercase tracking-widest transition hover:border-white/60 hover:bg-white/10"
              >
                Play now
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Show>
          </div>

          <button
            type="button"
            className="flex flex-col space-y-1.5 md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-4 bg-white" />
          </button>
        </header>

        {/* Mobile menu */}
        <div
          className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-sm transition-all duration-500 md:hidden ${
            menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 sm:px-10">
            <span className="font-podium text-2xl font-bold uppercase tracking-wider">Boris</span>
            <button type="button" aria-label="Close menu" onClick={closeMenu}>
              <X className="h-7 w-7 text-white" />
            </button>
          </div>
          <div className="flex h-[calc(100%-80px)] flex-col items-center justify-center gap-6 px-6">
            {(isSignedIn
              ? [
                  { label: 'Play', to: '/play' },
                  { label: 'Leaderboard', href: '#leaderboard' },
                ]
              : [
                  { label: 'Play', signIn: true },
                  { label: 'Leaderboard', href: '#leaderboard' },
                  { label: 'Sign in', signIn: true },
                ]
            ).map((item, i) => {
              const style = {
                transitionDelay: `${i * 80 + 100}ms`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.45s ease, transform 0.45s ease',
              };
              const className =
                'font-podium text-4xl uppercase text-white sm:text-5xl';
              if (item.to) {
                return (
                  <Link key={item.label} to={item.to} className={className} style={style} onClick={closeMenu}>
                    {item.label}
                  </Link>
                );
              }
              if (item.signIn) {
                return (
                  <SignInButton key={item.label} mode="modal">
                    <button type="button" className={className} style={style} onClick={closeMenu}>
                      {item.label}
                    </button>
                  </SignInButton>
                );
              }
              return (
                <a key={item.label} href={item.href} className={className} style={style} onClick={closeMenu}>
                  {item.label}
                </a>
              );
            })}
            <div
              style={{
                transitionDelay: `${(isSignedIn ? 2 : 3) * 80 + 100}ms`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.45s ease, transform 0.45s ease',
              }}
              className="mt-4"
            >
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 font-inter text-xs uppercase tracking-widest"
                  >
                    Sign up
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <div className="flex flex-col items-center gap-4">
                  <Link
                    to="/play"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 font-inter text-xs uppercase tracking-widest"
                  >
                    Play now
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </Show>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-16 pt-8 sm:px-10 lg:px-16">
          <div className="animate-fade-up mb-6 flex items-center gap-2 lg:mb-8">
            <Crown className="h-4 w-4 text-white/70" />
            <span className="font-inter text-xs uppercase tracking-[0.3em] text-white/70 sm:text-sm">
              Nothing Is As It Seems
            </span>
          </div>

          <h1 className="animate-fade-up-delay-1 font-podium text-[clamp(2.8rem,8vw,7rem)] uppercase leading-[0.92] tracking-tight text-white">
            <span className="block">Trust.</span>
            <span className="block">Nothing.</span>
            <span className="block">Survive.</span>
          </h1>

          <p className="animate-fade-up-delay-2 mt-6 max-w-md font-inter text-sm leading-relaxed text-white/70 sm:text-base lg:mt-8">
            A trap-filled platformer where floors drop and spikes rise —
            <br />
            platforms that look safe <span className="font-bold text-white">they lie.</span>
          </p>

          <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-4 sm:gap-6 lg:mt-10">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="group inline-flex items-center gap-2 bg-black px-5 py-3 font-inter text-[11px] uppercase tracking-widest text-white transition hover:bg-neutral-900 sm:px-7 sm:py-4 sm:text-xs"
                >
                  Play now
                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                to="/play"
                className="group inline-flex items-center gap-2 bg-black px-5 py-3 font-inter text-[11px] uppercase tracking-widest text-white transition hover:bg-neutral-900 sm:px-7 sm:py-4 sm:text-xs"
              >
                Play now
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Show>

            <div className="hidden items-center gap-3 sm:flex">
              <Award className="h-8 w-8 text-white/50" />
              <div className="font-inter text-xs uppercase tracking-wider text-white/60">
                <div>8 Levels</div>
                <div>Of Deception</div>
              </div>
            </div>
          </div>

          <div className="animate-fade-up-delay-4 mt-8 flex flex-wrap gap-6 sm:mt-10 sm:gap-12 lg:mt-14 lg:gap-16">
            {[
              { value: '8', label: 'Levels' },
              { value: '∞', label: 'Ways To Die' },
              { value: '1', label: 'Way Out' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-inter text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-1 font-inter text-[9px] uppercase tracking-widest text-white/50 sm:text-xs">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leaderboard (below fold) ── */}
      <section
        id="leaderboard"
        className="relative border-t border-white/10 bg-neutral-950 px-6 py-16 sm:px-10 lg:px-16"
        aria-labelledby="board-title"
      >
        <h2 id="board-title" className="font-podium text-4xl uppercase tracking-wider sm:text-5xl">
          Leaderboard
        </h2>
        <p className="mt-3 max-w-xl font-inter text-sm text-white/50 sm:text-base">
          Fewest deaths, then most coins. Scores sync to Supabase when configured.
        </p>

        <div className="mt-10 max-w-3xl">
          {boardLoading ? (
            <p className="font-inter text-white/50">Loading leaderboard…</p>
          ) : scores.length === 0 ? (
            <p className="font-inter text-white/50">
              No runs yet. Beat all eight levels to claim a spot.
            </p>
          ) : (
            <ol className="divide-y divide-white/10">
              {scores.map((entry, index) => (
                <li
                  key={entry.userId}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_5rem_5rem_6rem]"
                >
                  <span className="font-podium text-xl text-white/80">{index + 1}</span>
                  <span className="flex min-w-0 items-center gap-3">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt=""
                        className="h-7 w-7 rounded-full object-cover"
                        width={28}
                        height={28}
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                        {(entry.name || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="truncate font-semibold">{entry.name}</span>
                  </span>
                  <span className="hidden text-sm text-white/50 sm:block">{entry.deaths}</span>
                  <span className="hidden text-sm text-white/50 sm:block">{entry.coins}</span>
                  <span className="text-right text-xs text-white/40 sm:text-left sm:text-sm">
                    <span className="sm:hidden">
                      {entry.deaths}d · {entry.coins}c ·{' '}
                    </span>
                    {formatDate(entry.updatedAt)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
