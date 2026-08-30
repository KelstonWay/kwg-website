# Adversarial review — kwg-website branch titus/round-5 (copy round from Titus). Review the diff below for regressions, broken JSX, copy that contradicts other pages, accessibility, and anything that would break the build or the live site. Copy rules: plain sentences, no dashes. Output: verdict (APPROVE / FIX REQUIRED) then findings as path:line: severity: problem. fix.

a9156ef docs: round 5 report
8a52d48 copy(footer): note where the facility photos were taken
74f7daa copy(availability): remove the buyer-type subhead
ac71ef5 copy(team): tighten the hero line, eyebrow and closing band
3a0aa3b copy(home): retitle the photo tile, drop the section heading, open up the CTA
bc280a4 copy(home): swap hero emphasis to the family-owned line

diff --git a/src/components/Footer.tsx b/src/components/Footer.tsx
index fa7e9a9..d721f5e 100644
--- a/src/components/Footer.tsx
+++ b/src/components/Footer.tsx
@@ -77,12 +77,20 @@ export default function Footer() {
             </span>
           </p>
         </div>
       </div>
       <div className="mt-20 border-t border-stone-200/50 pt-8 text-center">
         <p className="font-body-md text-sm text-stone-500">
           © {new Date().getFullYear()} Kelston Way Greenhouse · Wholesale Grower · Oglesby, Texas
         </p>
+        {/* Titus 2026-08-29: the facility shots are Art's Paris, Kentucky greenhouse, so
+            the site says so once, here, rather than captioning every photo. Plant
+            photography is our own and needs no note. */}
+        <p className="mx-auto mt-4 max-w-2xl font-body-md text-xs leading-relaxed text-stone-500">
+          Facility photos are from Paris, Kentucky, the greenhouse Art built. This is not our
+          current Kelston Way facility in Oglesby. All plant photography shows product we grew
+          ourselves.
+        </p>
       </div>
     </footer>
   )
 }
diff --git a/src/pages/Availability.tsx b/src/pages/Availability.tsx
index 77ebdc1..0d267fa 100644
--- a/src/pages/Availability.tsx
+++ b/src/pages/Availability.tsx
@@ -418,19 +418,16 @@ export default function Availability() {
         <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
           <div>
             <span className="mb-1 block font-label-caps text-label-caps text-secondary">
               LIVE AVAILABILITY
             </span>
             <h1 className="font-['Newsreader'] text-2xl text-on-surface md:text-headline-xl">
               Current Wholesale Availability
             </h1>
-            <p className="mt-1 max-w-xl font-body-md text-sm text-on-surface-variant">
-              For garden centers and landscapers.
-            </p>
             {publishedAt && (
               <p className="mt-1 font-body-md text-sm text-on-surface-variant">
                 Updated{' '}
                 {new Date(publishedAt).toLocaleDateString('en-US', {
                   month: 'long',
                   day: 'numeric',
                   year: 'numeric',
                 })}
diff --git a/src/pages/Home.tsx b/src/pages/Home.tsx
index 9369a61..3047973 100644
--- a/src/pages/Home.tsx
+++ b/src/pages/Home.tsx
@@ -83,21 +83,21 @@ export default function Home() {
     <>
       {/* Hero */}
       <section className="flex flex-col items-center gap-10 overflow-hidden px-5 py-12 md:grid md:grid-cols-12 md:gap-16 md:px-32 md:py-20">
         <div className="z-10 md:col-span-6">
           <span className="mb-4 block font-label-caps text-label-caps text-secondary">
             WHOLESALE GROWER · OGLESBY, TEXAS
           </span>
           <h1 className="mb-6 font-['Newsreader'] text-3xl text-on-surface md:mb-8 md:text-display-lg">
-            Grown for <span className="italic text-primary">garden centers</span> and landscapers.
+            A <span className="italic text-primary">family-owned</span> greenhouse, growing annuals,
+            perennials, and seasonal color.
           </h1>
           <p className="mb-8 max-w-lg font-body-lg text-body-lg text-sm leading-relaxed text-on-surface-variant md:mb-10 md:text-base">
-            A family-owned wholesale greenhouse in Oglesby, Texas, growing annuals, perennials, and
-            seasonal color.
+            Grown for garden centers and landscapers.
           </p>
           <div className="flex flex-wrap gap-3 md:gap-4">
             <Link
               to="/availability"
               className="rounded-sm bg-primary px-6 py-3 font-button text-button text-sm text-on-primary transition-all duration-300 hover:bg-primary-container md:px-8 md:py-4"
             >
               View Availability
             </Link>
@@ -198,20 +198,16 @@ export default function Home() {
               <span className="font-button text-sm">View more</span>
             </Link>
           </div>
         </section>
       )}
 
       {/* Bento */}
       <section className="bg-stone-50 px-5 py-14 md:px-32 md:py-20">
-        <div className="mx-auto mb-20 max-w-2xl text-center">
-          <h2 className="mb-6 font-['Newsreader'] text-headline-xl">Our Greenhouse</h2>
-          <div className="mx-auto h-[1px] w-12 bg-secondary" />
-        </div>
         <div className="grid h-auto grid-cols-1 grid-rows-2 gap-8 md:h-[800px] md:grid-cols-4">
           <div className="group relative overflow-hidden rounded-sm bg-stone-200 md:col-span-2 md:row-span-2">
             <img
               src={BENTO_IMG}
               alt="Kelston Way greenhouse"
               className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
               loading="lazy"
             />
@@ -236,17 +232,17 @@ export default function Home() {
               className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
               loading="lazy"
             />
             {/* Titus 2026-08-01: hover panel dropped, photo keeps its label only. The
                 scrim replaces the contrast the panel used to give the label. */}
             <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
             <div className="absolute bottom-6 left-6">
               <h3 className="font-['Newsreader'] text-2xl text-white drop-shadow-md">
-                Grown with Care
+                Quality, Every Tray
               </h3>
             </div>
           </div>
           <div className="flex flex-col items-center justify-center rounded-sm bg-secondary-container p-6 text-center md:col-span-1 md:row-span-1">
             <span className="material-symbols-outlined mb-3 text-3xl text-secondary">
               calendar_month
             </span>
             <h3 className="mb-2 font-['Newsreader'] text-lg text-on-secondary-container">
@@ -255,17 +251,17 @@ export default function Home() {
             <p className="mb-4 font-body-md text-xs text-on-secondary-fixed-variant">
               See what's available.
             </p>
           </div>
           <div className="flex flex-col items-center justify-center rounded-sm bg-primary p-6 text-center text-on-primary md:col-span-1 md:row-span-1">
             <span className="material-symbols-outlined mb-3 text-3xl">handshake</span>
             <h3 className="mb-2 font-['Newsreader'] text-lg">Work With Us</h3>
             <p className="mb-4 font-body-md text-xs opacity-90">
-              Garden center or landscaper? Email us to get started.
+              Ready to work together? Email us to get started.
             </p>
             <a
               href="#inquire"
               className="border-b border-white font-button text-[10px] uppercase tracking-widest"
             >
               Contact Us
             </a>
           </div>
diff --git a/src/pages/MeetTheTeam.tsx b/src/pages/MeetTheTeam.tsx
index 20477ba..d675286 100644
--- a/src/pages/MeetTheTeam.tsx
+++ b/src/pages/MeetTheTeam.tsx
@@ -71,17 +71,17 @@ export default function MeetTheTeam() {
             <span className="mb-5 block font-label-caps text-label-caps text-primary">
               Family-Owned Wholesale Grower · Oglesby, Texas
             </span>
             <h1 className="mb-6 font-['Newsreader'] text-4xl font-light leading-[1.08] text-on-surface md:text-[58px]">
               A family-owned wholesale greenhouse in{' '}
               <em className="font-normal italic text-primary">Oglesby, Texas.</em>
             </h1>
             <p className="mb-10 max-w-lg font-body-lg text-body-lg font-light leading-relaxed text-secondary">
-              We grow annuals, perennials, and seasonal color for garden centers and landscapers.
+              Growing annuals, perennials, and seasonal color.
             </p>
             <div className="flex flex-wrap gap-4">
               <Link
                 to="/availability"
                 className="rounded-sm bg-primary px-8 py-3.5 font-button text-button text-on-primary transition-all duration-300 hover:opacity-90"
               >
                 View Availability
               </Link>
@@ -105,17 +105,17 @@ export default function MeetTheTeam() {
         </div>
       </section>
 
       {/* Team */}
       <section className="bg-white px-5 py-20 md:px-16 md:py-24">
         <div className="mx-auto max-w-7xl">
           <div className="mb-12 border-b border-outline-variant/40 pb-3">
             <span className="font-label-caps text-[10px] font-medium uppercase tracking-[0.25em] text-on-surface-variant">
-              Family Owned. Built for the Long Term.
+              Family Owned and Operated.
             </span>
           </div>
           <h2 className="mb-6 font-['Newsreader'] text-3xl font-light leading-[1.15] text-on-surface md:text-[42px]">
             Meet the team behind <em className="font-normal italic text-primary">Kelston Way.</em>
           </h2>
           <p className="mb-14 max-w-3xl font-body-lg font-light leading-relaxed text-secondary">
             Kelston Way brings together decades of commercial greenhouse experience with hands-on
             knowledge in production, operations, replenishment, technology, sales, and customer
@@ -218,17 +218,17 @@ export default function MeetTheTeam() {
       </section>
 
       {/* CTA Band */}
       <section id="inquire" className="bg-primary px-5 py-20 text-center text-on-primary md:px-16">
         <h2 className="mb-4 font-['Newsreader'] text-3xl font-light leading-[1.15] md:text-[44px]">
           Contact Us
         </h2>
         <p className="mx-auto mb-10 max-w-xl font-body-lg font-light text-primary-fixed/80">
-          If you're a garden center or landscaper looking for a reliable grower, get in touch.
+          Looking for a reliable grower? Get in touch.
         </p>
         <div className="flex flex-wrap justify-center gap-4">
           <Link
             to="/contact"
             className="rounded-sm bg-secondary-container px-8 py-3.5 font-button text-button text-secondary transition-all duration-300 hover:opacity-90"
           >
             Contact Us
           </Link>
