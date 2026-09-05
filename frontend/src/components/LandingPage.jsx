import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';
import { getTopScores } from '@/lib/leaderboard';

const HERO_IMAGE = '/Gemini_Generated_Image_lbips5lbips5lbip.png';

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
  const [scores, setScores] = useState([]);

  useEffect(() => {
    setScores(getTopScores(10));
    const onFocus = () => setScores(getTopScores(10));
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <div className="landing">
      <header className="landing-nav">
        <span className="landing-nav-brand">Boris</span>
        <div className="landing-nav-auth">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="landing-btn landing-btn-ghost">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="landing-btn landing-btn-solid">
                Sign up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton afterSignOutUrl="/" />
          </Show>
        </div>
      </header>

      <section className="landing-hero" aria-label="Boris hero">
        <div
          className="landing-hero-bg"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="landing-hero-veil" />
        <div className="landing-hero-content">
          <p className="landing-brand">Boris</p>
          <h1 className="landing-headline">Nothing is as it seems.</h1>
          <p className="landing-support">
            A trap-filled platformer where floors drop, spikes rise, and trust is optional.
          </p>
          <div className="landing-cta">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button type="button" className="landing-btn landing-btn-solid landing-btn-lg">
                  Sign up to play
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button type="button" className="landing-btn landing-btn-ghost landing-btn-lg">
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link to="/play" className="landing-btn landing-btn-solid landing-btn-lg">
                Play
              </Link>
            </Show>
          </div>
        </div>
      </section>

      <section className="landing-board" id="leaderboard" aria-labelledby="board-title">
        <div className="landing-board-inner">
          <h2 id="board-title" className="landing-board-title">
            Leaderboard
          </h2>
          <p className="landing-board-sub">
            Fewest deaths, then most coins. Scores stay on this device for local play.
          </p>

          {scores.length === 0 ? (
            <p className="landing-board-empty">
              No runs yet. Beat all eight levels to claim a spot.
            </p>
          ) : (
            <>
              <div className="landing-board-head" aria-hidden="true">
                <span>#</span>
                <span>Player</span>
                <span>Deaths</span>
                <span>Coins</span>
                <span>Date</span>
              </div>
              <ol className="landing-board-list">
                {scores.map((entry, index) => (
                  <li
                    key={entry.userId}
                    className="landing-board-row"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="landing-rank">{index + 1}</span>
                    <span className="landing-name">{entry.name}</span>
                    <span className="landing-stat" title="Deaths">
                      {entry.deaths}
                    </span>
                    <span className="landing-stat" title="Coins">
                      {entry.coins}
                    </span>
                    <span className="landing-date">{formatDate(entry.updatedAt)}</span>
                    <div className="landing-meta">
                      <span>{entry.deaths} deaths</span>
                      <span>{entry.coins} coins</span>
                      <span>{formatDate(entry.updatedAt)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
