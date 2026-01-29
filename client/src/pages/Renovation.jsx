import React from 'react';

const Renovation = () => {
  return (
    <>
      <div className="bg-decoration"></div>

      <section className="hero-banner-section renovation-bg">
        <div className="hero-banner-container">
          <div className="hero-banner-content">
            <div className="hero-banner-tagline">Excellence in Transformation</div>
            <h1>Our Renovation<br />Process</h1>
            <p>
              From initial concept to final walkthrough, we ensure every detail of your home's transformation is handled with precision, care, and quality craftsmanship.
            </p>
          </div>
        </div>
      </section>

      <div className="content-wrapper">
        <section className="intro-text-section">
          <h2>Renovation</h2>
          <p>Whether it's a kitchen upgrade, a bathroom remodel, or a complete home makeover — Maria Homes delivers thoughtful, stylish, and functional renovations tailored to your lifestyle. With an experienced team and an eye for detail, we focus on making the old feel brand new — efficiently, affordably, and beautifully.</p>
        </section>

        <header className="header">
          <h2>Our Renovation Process</h2>
        </header>

        <main className="grid-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="card-header">
              <div className="icon-box bg-brand-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="card-title">Consultation & Evaluation</h3>
            </div>
            <p className="card-desc">In-depth space analysis and structural feasibility study to understand your vision.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="card-header">
              <div className="icon-box bg-brand-dark">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
              </div>
              <h3 className="card-title">Design & Selection</h3>
            </div>
            <p className="card-desc">Detailed layouts and premium fixture curation aligned with your aesthetic goals.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="card-header">
              <div className="icon-box bg-brand-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h3 className="card-title">Quote & Timeline</h3>
            </div>
            <p className="card-desc">Scope finalization and project roadmap delivery for a transparent investment.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <div className="card-header">
              <div className="icon-box bg-brand-dark">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-8 4-5 2L3 11l5 4 4 1 7 4 2-1V2Z"/><path d="M5.4 16.5 17 3"/></svg>
              </div>
              <h3 className="card-title">Demolition & Prep</h3>
            </div>
            <p className="card-desc">Controlled removal and foundational transformation to prepare for the new build.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>

          <div className="step-card">
            <div className="step-number">05</div>
            <div className="card-header">
              <div className="icon-box bg-brand-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3Z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z"/><path d="m2 2 5 5"/><path d="m8.5 8.5 1 1"/></svg>
              </div>
              <h3 className="card-title">Install & Finishing</h3>
            </div>
            <p className="card-desc">Expert craftsmanship in plumbing, electric, and carpentry to bring it all together.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>

          <div className="step-card">
            <div className="step-number">06</div>
            <div className="card-header">
              <div className="icon-box bg-brand-dark">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="card-title">Walkthrough & Completion</h3>
            </div>
            <p className="card-desc">Final inspection and official project handover to ensure your total satisfaction.</p>
            <div className="accent-bar bg-brand-orange"></div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Renovation;