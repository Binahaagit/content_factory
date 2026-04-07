import { useNavigate } from "react-router-dom"
import { useEffect, useRef } from "react"

export default function Landing() {
  const navigate = useNavigate()

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,600&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body, html { background:#3b0764; font-family:'DM Sans',sans-serif; overflow-x:hidden; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes scrollDot {
          0%,100% { transform:translateY(0); opacity:0.5; }
          50%     { transform:translateY(8px); opacity:0.15; }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position:200% center; }
        }

        .lw {
          min-height:100vh; position:relative; overflow-x:hidden;
          background:
            radial-gradient(ellipse 110% 70% at 50% 0%,   #7c2fbd 0%, transparent 60%),
            radial-gradient(ellipse 80%  60% at 100% 50%,  #6d1fa8 0%, transparent 55%),
            radial-gradient(ellipse 70%  55% at 0%   80%,  #5b1196 0%, transparent 50%),
            radial-gradient(ellipse 90%  80% at 50%  100%, #4a0e82 0%, transparent 65%),
            linear-gradient(160deg, #5c1199 0%, #3b0764 40%, #4e1090 70%, #3b0764 100%);
        }
        .lw::before {
          content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(230,180,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(230,180,255,0.06) 1px, transparent 1px);
          background-size:72px 72px;
        }

        /* ── NAV — darker purple ── */
        .lnav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 52px;
          background:rgba(28,4,52,0.85);
          backdrop-filter:blur(28px);
          border-bottom:1px solid rgba(180,100,255,0.12);
          opacity:0;
          animation:fadeIn 0.6s ease forwards 0.1s;
        }
        .lnav-logo { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .lnav-mark {
          width:32px; height:32px; border-radius:8px;
          background:linear-gradient(135deg,#9333ea,#d946ef);
          display:flex; align-items:center; justify-content:center;
          font-family:'Cormorant Garamond',serif;
          font-size:17px; font-weight:600; color:rgba(255,255,255,0.9);
        }
        .lnav-name {
          font-size:13px; font-weight:500;
          letter-spacing:0.14em; text-transform:uppercase;
          color:rgba(220,180,255,0.6);
        }
        .lnav-links { display:flex; align-items:center; gap:36px; }
        .lnav-link {
          font-size:13px; font-weight:400;
          color:rgba(210,170,255,0.55);
          cursor:pointer; letter-spacing:0.03em;
          transition:color 0.2s;
          background:none; border:none; font-family:inherit;
        }
        .lnav-link:hover { color:rgba(235,205,255,0.9); }
        .lnav-cta {
          font-size:13px; font-weight:500;
          color:rgba(240,210,255,0.9);
          background:rgba(120,40,200,0.35);
          border:1px solid rgba(200,150,255,0.3);
          border-radius:100px; padding:9px 22px;
          cursor:pointer; letter-spacing:0.04em;
          transition:all 0.2s; font-family:inherit;
        }
        .lnav-cta:hover {
          background:rgba(140,50,210,0.55);
          border-color:rgba(220,180,255,0.5);
        }

        /* ── HERO ── */
        .lhero {
          min-height:100vh;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          text-align:center; padding:110px 24px 80px;
          position:relative; z-index:1;
        }
        .lbadge {
          display:inline-flex; align-items:center; gap:8px;
          padding:7px 20px;
          background:rgba(120,40,200,0.15);
          border:1px solid rgba(200,150,255,0.2);
          border-radius:100px; margin-bottom:52px;
          opacity:0; animation:fadeUp 0.7s ease forwards 0.25s;
        }
        .lbadge-dot { width:5px; height:5px; border-radius:50%; background:rgba(210,170,255,0.7); }
        .lbadge-txt { font-size:12px; font-weight:400; color:rgba(210,170,255,0.7); letter-spacing:0.07em; }

        .lwordmark { display:flex; align-items:baseline; line-height:1; margin-bottom:36px; }
        .lword {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(72px,12vw,160px);
          font-weight:300; letter-spacing:-0.04em;
          color:rgba(210,175,255,0.55); line-height:1;
          opacity:0; animation:fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards 0.4s;
        }
        .lloom {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(72px,12vw,160px);
          font-weight:300; font-style:italic; letter-spacing:-0.03em; line-height:1;
          background:linear-gradient(90deg,#e879f9 0%,#f472b6 30%,#fda4af 50%,#f472b6 70%,#e879f9 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          opacity:0;
          animation:
            fadeUp  0.9s cubic-bezier(0.16,1,0.3,1) forwards 0.55s,
            shimmer 2.2s linear forwards 0.9s;
        }
        .ltagline {
          max-width:520px; font-size:clamp(15px,1.8vw,18px);
          font-weight:300; line-height:1.75;
          color:rgba(220,185,255,0.72); letter-spacing:0.01em; margin-bottom:10px;
          opacity:0; animation:fadeUp 0.8s ease forwards 0.75s;
        }
        .ltagline em { font-style:italic; color:rgba(235,205,255,0.88); }
        .lsub {
          font-size:14px; font-weight:300;
          color:rgba(196,155,255,0.52); letter-spacing:0.04em; margin-bottom:48px;
          opacity:0; animation:fadeUp 0.8s ease forwards 0.9s;
        }
        .lcta {
          font-family:'DM Sans',sans-serif; font-size:15px; font-weight:500;
          color:rgba(245,215,255,0.95);
          background:linear-gradient(135deg,rgba(120,34,200,0.7),rgba(210,70,235,0.6));
          border:1px solid rgba(210,170,255,0.28); border-radius:100px;
          padding:16px 52px; cursor:pointer; letter-spacing:0.04em;
          transition:all 0.25s;
          box-shadow:0 0 40px rgba(120,34,200,0.35), inset 0 1px 0 rgba(255,255,255,0.1);
          opacity:0; animation:fadeUp 0.8s ease forwards 1.05s;
        }
        .lcta:hover {
          background:linear-gradient(135deg,rgba(120,34,200,0.9),rgba(210,70,235,0.8));
          box-shadow:0 0 64px rgba(120,34,200,0.55), inset 0 1px 0 rgba(255,255,255,0.12);
          transform:translateY(-2px);
        }
        .lscroll {
          position:absolute; bottom:32px;
          display:flex; flex-direction:column; align-items:center; gap:8px;
          opacity:0; animation:fadeIn 1s ease forwards 1.4s;
        }
        .lscroll-mouse {
          width:24px; height:38px;
          border:1px solid rgba(210,170,255,0.22); border-radius:12px;
          display:flex; justify-content:center; padding-top:7px;
        }
        .lscroll-wheel {
          width:3px; height:7px; background:rgba(210,170,255,0.45); border-radius:2px;
          animation:scrollDot 1.6s ease-in-out infinite;
        }

        /* ── SECTIONS ── */
        .lsec { position:relative; z-index:1; max-width:980px; margin:0 auto; padding:80px 48px; }
        .lsec-label {
          font-size:10px; font-weight:500; letter-spacing:0.22em; text-transform:uppercase;
          color:rgba(214,100,246,0.8);
          margin-bottom:48px; text-align:center;
        }

        /* Section divider line */
        .lsec-divider {
          width:60px; height:1px;
          background:linear-gradient(90deg, transparent, rgba(200,150,255,0.3), transparent);
          margin: 0 auto 16px;
        }

        /* ── HOW IT WORKS — elegant cards ── */
        .lflow { display:grid; grid-template-columns:1fr auto 1fr auto 1fr; align-items:start; gap:16px; }
        .lflow-card {
          background:rgba(100,30,170,0.12);
          border:1px solid rgba(180,120,255,0.16);
          border-radius:20px; padding:32px 24px;
          transition:all 0.25s; position:relative; overflow:hidden;
        }
        .lflow-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent, rgba(210,170,255,0.3), transparent);
        }
        .lflow-card:hover {
          background:rgba(120,40,190,0.2);
          border-color:rgba(210,160,255,0.28);
          transform:translateY(-4px);
          box-shadow:0 16px 40px rgba(80,10,140,0.3);
        }
        .lflow-num {
          font-family:'Cormorant Garamond',serif;
          font-size:42px; font-weight:300; font-style:italic;
          color:rgba(180,120,255,0.65); line-height:1;
          margin-bottom:16px; letter-spacing:-0.02em;
        }
        .lflow-tag {
          font-size:9.5px; font-weight:500;
          letter-spacing:0.2em; text-transform:uppercase;
          margin-bottom:10px; display:inline-flex; align-items:center; gap:6px;
        }
        .lflow-tag-dot { width:4px; height:4px; border-radius:50%; }
        .lflow-title {
          font-family:'Cormorant Garamond',serif;
          font-size:24px; font-weight:600;
          letter-spacing:-0.02em; margin-bottom:12px;
          color:rgba(230,200,255,0.8);
        }
        .lflow-desc { font-size:13px; font-weight:300; line-height:1.8; color:rgba(200,165,255,0.55); }
        .lflow-arrow {
          font-size:18px; color:rgba(180,120,255,0.2);
          text-align:center; padding-top:60px;
        }

        /* ── FEATURES — elegant grid ── */
        .lfeat-wrap {
          display:grid; grid-template-columns:repeat(2,1fr);
          gap:16px;
        }
        .lfeat-cell {
          background:rgba(100,30,170,0.1);
          border:1px solid rgba(180,120,255,0.14);
          border-radius:20px; padding:32px 28px;
          transition:all 0.25s; cursor:default; position:relative; overflow:hidden;
        }
        .lfeat-cell::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent, rgba(210,170,255,0.25), transparent);
        }
        .lfeat-cell:hover {
          background:rgba(120,40,190,0.18);
          border-color:rgba(210,160,255,0.25);
          transform:translateY(-3px);
          box-shadow:0 12px 32px rgba(80,10,140,0.25);
        }
        .lfeat-num {
          font-family:'Cormorant Garamond',serif;
          font-size:13px; font-weight:300; font-style:italic;
          color:rgba(206, 196, 219, 0.85); letter-spacing:0.1em;
          margin-bottom:16px;
        }
        .lfeat-title {
          font-size:15px; font-weight:500;
          color:rgba(214, 100, 246, 0.85);
          margin-bottom:10px; letter-spacing:-0.01em;
        }
        .lfeat-desc { font-size:13px; font-weight:300; line-height:1.75; color:rgba(200,165,255,0.8); }

        /* ── FINAL CTA ── */
        .lfinal { text-align:center; padding:80px 24px 100px; position:relative; z-index:1; }
        .lfinal-h {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(40px,6vw,64px); font-weight:300; line-height:1.1;
          letter-spacing:-0.03em; color:rgba(220,185,255,0.65); margin-bottom:16px;
        }
        .lfinal-h em {
          font-style:italic;
          background:linear-gradient(135deg,#e879f9,#f472b6);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .lfinal-sub { font-size:14px; font-weight:300; color:rgba(196,150,255,0.4); margin-bottom:36px; letter-spacing:0.02em; }

        /* ── FOOTER ── */
        .lfooter {
          position:relative; z-index:1; padding:24px 52px;
          border-top:1px solid rgba(180,120,255,0.08);
          display:flex; justify-content:space-between; align-items:center;
        }
        .lfooter-brand { font-family:'Cormorant Garamond',serif; font-size:15px; font-weight:300; color:rgba(196,150,255,0.3); letter-spacing:0.08em; }
        .lfooter-note { font-size:11.5px; font-weight:300; color:rgba(196,150,255,0.25); letter-spacing:0.04em; }
      `}</style>

      <div className="lw">

        {/* NAV */}
        <nav className="lnav">
          <div className="lnav-logo" onClick={() => navigate("/")}>
            <div className="lnav-mark">W</div>
            <span className="lnav-name">WordLoom</span>
          </div>
          <div className="lnav-links">
            <button className="lnav-link" onClick={() => scrollTo("how-it-works")}>
              How it Works
            </button>
            <button className="lnav-link" onClick={() => scrollTo("features")}>
              Features
            </button>
            <button className="lnav-cta" onClick={() => navigate("/app")}>Try Now</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="lhero">
          <div className="lbadge">
            <div className="lbadge-dot"/>
            <span className="lbadge-txt">✦ Weaving Words into Wonder</span>
          </div>
          <div className="lwordmark">
            <span className="lword">WORD</span>
            <span className="lloom">LOOM</span>
          </div>
          <p className="ltagline">
            Transform your thoughts into beautifully crafted stories.{" "}
            <em>An intelligent writing companion</em>{" "}
            that understands your creative voice.
          </p>
          <p className="lsub">A blog post, social thread and email — instantly.</p>
          <button className="lcta" onClick={() => navigate("/app")}>Start Creating →</button>
          <div className="lscroll">
            <div className="lscroll-mouse"><div className="lscroll-wheel"/></div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <div id="how-it-works" className="lsec">
          <div className="lsec-divider"/>
          <div className="lsec-label">How it works</div>
          <div className="lflow">
            {[
              { n:"01", tag:"Agent 1", color:"#c084fc", dot:"#c084fc",
                title:"Fact Checker",
                desc:"Reads your raw source material. Extracts core features, target audience, and value proposition. Flags any vague or unverifiable claims." },
              { n:"02", tag:"Agent 2", color:"#e879f9", dot:"#e879f9",
                title:"Copywriter",
                desc:"Takes the verified fact sheet and writes three distinct content pieces — each tuned to its platform and your chosen tone." },
              { n:"03", tag:"Result",  color:"#f472b6", dot:"#f472b6",
                title:"3 Outputs",
                desc:"A 500-word blog post, a 5-part social thread, and an email teaser — all consistent, accurate, and publish-ready." }
            ].reduce((acc, card, i) => {
              acc.push(
                <div key={card.n} className="lflow-card">
                  <div className="lflow-num">{card.n}</div>
                  <div className="lflow-tag" style={{color:card.color}}>
                    <div className="lflow-tag-dot" style={{background:card.dot}}/>
                    {card.tag}
                  </div>
                  <div className="lflow-title">{card.title}</div>
                  <div className="lflow-desc">{card.desc}</div>
                </div>
              )
              if (i < 2) acc.push(
                <div key={`a${i}`} className="lflow-arrow">→</div>
              )
              return acc
            }, [])}
          </div>
        </div>

        {/* FEATURES */}
        <div id="features" className="lsec" style={{paddingTop:0}}>
          <div className="lsec-divider"/>
          <div className="lsec-label">Features</div>
          <div className="lfeat-wrap">
            {[
              { n:"01", title:"Fact-checked first",
                desc:"Every claim is verified before writing begins. Agent 1 flags ambiguous statements so nothing unverified makes it into your content." },
              { n:"02", title:"Tone selector",
                desc:"Choose Professional, Casual, or Witty before generating. The tone is applied consistently across your blog post, social thread, and email." },
              { n:"03", title:"Editable fact sheet",
                desc:"Review and correct Agent 1's findings before Agent 2 writes a single word. You stay in control of the facts." },
              { n:"04", title:"One click, three formats",
                desc:"Blog post, social media thread, and email teaser — all generated from one source document, all perfectly on-brand." }
            ].map((f,i) => (
              <div key={i} className="lfeat-cell">
                <div className="lfeat-num">— {f.n}</div>
                <div className="lfeat-title">{f.title}</div>
                <div className="lfeat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="lfinal">
          <div className="lfinal-h">
            Ready to weave<br/>
            <em>better content?</em>
          </div>
          <p className="lfinal-sub">Free to use. No account needed.</p>
          <button className="lcta" onClick={() => navigate("/app")}>Start Creating →</button>
        </div>

        {/* FOOTER */}
        <footer className="lfooter">
          <span className="lfooter-brand">WORD<em>LOOM</em></span>
          <span className="lfooter-note">Crafted with care ✦</span>
        </footer>

      </div>
    </>
  )
}