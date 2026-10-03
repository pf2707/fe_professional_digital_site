import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DigitalTwin } from "@/components/DigitalTwin";
import { Projects } from "@/components/Projects";
import { profile } from "@/lib/profile";

export default function Home() {
  return (
    <>
      {/* NAV */}
      <nav>
        <div className="wrap nav-inner">
          <div className="logo">
            {profile.name.split(" ")[0]}
            <span>{profile.name.split(" ").slice(1).join(" ") || "."}</span>
          </div>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#experience">Experience</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <button className="nav-cta" data-open-twin>
              Ask my Digital Twin
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            {profile.available && (
              <span className="eyebrow">
                <span className="dot" /> Available for new opportunities
              </span>
            )}
            <h1>
              Hi, I&apos;m {profile.name}.<br />
              {profile.tagline.split(" ").slice(0, -2).join(" ")}{" "}
              <em>{profile.tagline.split(" ").slice(-2).join(" ")}</em>
            </h1>
            <p className="lead">
              {profile.title} with 10+ years turning ideas into reliable,
              high-performing apps — and intelligent agents. This is my living,
              interactive CV.
            </p>
            <div className="btn-row">
              <button className="btn btn-primary" data-open-twin>
                💬 Chat with my Digital Twin
              </button>
              <a href="#contact" className="btn btn-ghost">
                ✉ Get in touch
              </a>
            </div>
          </div>
          <div className="avatar-card">
            <div className="avatar">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={120}
                  height={120}
                  className="avatar-photo"
                  priority
                />
              ) : (
                profile.initials
              )}
            </div>
            <h3>{profile.name}</h3>
            <p>{profile.title}</p>
            <div className="quick-stats">
              {profile.stats.map((s) => (
                <div key={s.label}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ABOUT */}
      <section id="about">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">01 — About</span>
            <h2>A bit about me</h2>
          </div>
          <div className="about-grid">
            <div>
              {profile.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="info-list">
              <div className="row">
                <span>Location</span>
                <span>{profile.location}</span>
              </div>
              <div className="row">
                <span>Email</span>
                <span>{profile.email}</span>
              </div>
              <div className="row">
                <span>Experience</span>
                <span>10+ years</span>
              </div>
              <div className="row">
                <span>Languages</span>
                <span>{profile.languages}</span>
              </div>
              <div className="row">
                <span>Status</span>
                <span>{profile.available ? "Open to offers" : "Not looking"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="alt">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">02 — Career</span>
            <h2>Experience</h2>
          </div>
          <div className="timeline">
            {profile.experience.map((e, i) => (
              <div className="t-item" key={i}>
                <div className="t-date">{e.period}</div>
                <h4>{e.role}</h4>
                <div className="t-org">{e.org}</div>
                <p>{e.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">03 — Expertise</span>
            <h2>Skills &amp; Tools</h2>
          </div>
          <div className="skills-grid">
            {profile.skills.map((s) => (
              <div className="skill-card" key={s.group}>
                <h4>{s.group}</h4>
                <div className="tags">
                  {s.items.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="alt">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">04 — Portfolio</span>
            <h2>Selected Projects</h2>
          </div>
          <Projects
            projects={profile.projects}
            featuredPerGroup={profile.featuredPerGroup}
          />
        </div>
      </section>

      {/* DIGITAL TWIN */}
      <section id="twin">
        <div className="wrap">
          <div className="twin">
            <span className="eyebrow">
              <span className="dot" /> Powered by AI
            </span>
            <h2>Meet my Digital Twin</h2>
            <p>
              Have a question about my experience, skills, or fit for a role? Ask my
              AI-powered digital twin anything — it knows my story and answers 24/7.
            </p>
            <button className="btn btn-primary" data-open-twin>
              Start a conversation
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="logo foot-logo">
                {profile.name.split(" ")[0]}
                <span>{profile.name.split(" ").slice(1).join(" ") || "."}</span>
              </div>
              <p className="foot-tag">Let&apos;s build something great together.</p>
              <p className="foot-email">
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </p>
            </div>
            <div className="socials">
              {profile.socials.map((s) => (
                <a key={s.title} href={s.href} title={s.title}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div className="copyright">
            © {new Date().getFullYear()} {profile.name} · Built with Next.js.
          </div>
        </div>
      </footer>

      <DigitalTwin />
    </>
  );
}
