import { useEffect, useState } from "react";
import { ArrowLeft, Check, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { LEGAL_TERMS_EFFECTIVE_DATE, LEGAL_TERMS_VERSION, globalTerms, regionalAddenda, type LegalSection } from "@/lib/legalTerms";

export const LEGAL_ACCEPTANCE_STORAGE_KEY = "skyroute.legal.acceptance";

type AcceptanceRecord = {
  version: string;
  acceptedAt: string;
  userAgent: string;
};

export function readLegalAcceptance(): AcceptanceRecord | null {
  try {
    const raw = window.localStorage.getItem(LEGAL_ACCEPTANCE_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as AcceptanceRecord;
    return value.version === LEGAL_TERMS_VERSION ? value : null;
  } catch {
    return null;
  }
}

export function saveLegalAcceptance() {
  const record: AcceptanceRecord = {
    version: LEGAL_TERMS_VERSION,
    acceptedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };
  window.localStorage.setItem(LEGAL_ACCEPTANCE_STORAGE_KEY, JSON.stringify(record));
  return record;
}

function Section({ section }: { section: LegalSection }) {
  return (
    <section className="legal-section">
      <h2>{section.title}</h2>
      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {section.bullets ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
    </section>
  );
}

export function LegalTermsPage() {
  const [, navigate] = useLocation();
  const [accepted, setAccepted] = useState(Boolean(readLegalAcceptance()));

  const accept = () => {
    saveLegalAcceptance();
    setAccepted(true);
    navigate("/");
  };

  return (
    <div className="legal-page">
      <header className="legal-header site-shell">
        <button className="legal-back" onClick={() => navigate("/")}><ArrowLeft size={16} />Back to SkyRoute</button>
        <span className="legal-version"><FileText size={15} />Version {LEGAL_TERMS_VERSION}</span>
      </header>
      <main className="legal-document site-shell">
        <div className="legal-intro">
          <span className="eyebrow"><span className="eyebrow-dot" />Clear terms, no surprises</span>
          <h1>SkyRoute Terms of Service</h1>
          <p>Global core terms with regional addenda for the markets where SkyRoute is planned to grow. Effective {LEGAL_TERMS_EFFECTIVE_DATE}.</p>
          <div className="legal-notice"><ShieldCheck size={20} /><span>This is a product draft that must be completed and reviewed by qualified counsel before launch. It preserves rights that local law does not allow a service to waive.</span></div>
        </div>

        <div className="legal-layout">
          <article className="legal-card">
            {globalTerms.map((section) => <Section key={section.title} section={section} />)}
            <div className="legal-sources-note"><strong>Official source note.</strong> Regional source links are verification references, not a certification that SkyRoute complies with every law. Laws, guidance, carrier rules and addenda must be rechecked before launch and after material product changes.</div>
          </article>
          <aside className="legal-sidebar">
            <div className="legal-sidebar-card">
              <h2>Regional addenda</h2>
              <p>Use the addendum matching the customer, booking, route, supplier and data-processing facts. One country rule cannot safely be applied to every trip.</p>
              <nav aria-label="Regional legal addenda">
                {regionalAddenda.map((addendum) => <a key={addendum.id} href={`#${addendum.id}`}>{addendum.title}</a>)}
              </nav>
            </div>
            <div className="legal-sidebar-card legal-accept-card">
              <LockKeyhole size={20} />
              <h2>Before you enter</h2>
              <p>SkyRoute uses an affirmative clickwrap acceptance. You can read the full terms here before agreeing.</p>
              <label className="legal-checkbox"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>I have read and agree to the SkyRoute Terms of Service and the applicable regional addendum. I understand that mandatory legal rights are preserved.</span></label>
              <button className="legal-accept-button" disabled={!accepted} onClick={accept}><Check size={16} />Accept and enter SkyRoute</button>
            </div>
          </aside>
        </div>

        <div className="legal-addenda">
          <h2>Regional addenda</h2>
          {regionalAddenda.map((addendum) => <section className="legal-addendum" id={addendum.id} key={addendum.id}><h3>{addendum.title}</h3><p className="legal-summary">{addendum.summary}</p>{addendum.sections.map((section) => <Section key={section.title} section={section} />)}<div className="legal-sources"><strong>Official references for review:</strong>{addendum.sources.map((item) => <a key={item.href} href={item.href} target="_blank" rel="noreferrer">{item.label}</a>)}</div></section>)}
        </div>
      </main>
    </div>
  );
}

export function LegalAccessGate({ onAccept }: { onAccept: () => void }) {
  const [, navigate] = useLocation();
  const [checked, setChecked] = useState(false);
  const accept = () => {
    saveLegalAcceptance();
    onAccept();
  };
  return (
    <div className="legal-gate" role="dialog" aria-modal="true" aria-labelledby="legal-gate-title">
      <div className="legal-gate-card">
        <div className="legal-gate-icon"><ShieldCheck size={25} /></div>
        <span className="section-kicker">Welcome to SkyRoute</span>
        <h1 id="legal-gate-title">A clear agreement before you start.</h1>
        <p>SkyRoute shows fare, supplier, refund and support details before you book. Please review and accept the Terms of Service and the regional addendum that applies to your journey.</p>
        <button className="legal-read-button" onClick={() => navigate("/legal/terms")}><FileText size={16} />Read full Terms and regional addenda</button>
        <label className="legal-checkbox"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><span>I agree to the SkyRoute Terms of Service and applicable regional addendum. I understand that mandatory consumer and passenger rights are not waived.</span></label>
        <button className="legal-accept-button" disabled={!checked} onClick={accept}><Check size={16} />Accept and enter</button>
        <small>Terms version {LEGAL_TERMS_VERSION} · Effective {LEGAL_TERMS_EFFECTIVE_DATE}</small>
      </div>
    </div>
  );
}
