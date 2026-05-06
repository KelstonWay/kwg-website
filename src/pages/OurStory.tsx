const STORY_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbYPDSXshUOu9E_hnQV5Z4_7LkjpIZcLe8fY90esgAr2IY_28Yy0z7pKsd9WmnY04Gj1HMD0nPt8QluMp8FhTkeB0p0kG1F8U-S0qGUmWouffHDXXmjQ2Ua4LyS-0vVPGiJAmkLnqLvAyb2ST1n510dkeH2rzm_3HJrkK3LJEXypc69hE25r4aOo404JVxMKkNTx6KbMi_LzNgIRWrI6ERgEp9tbg7kHBlz_mF5e0u7yN6QxlgE8pG3bagvE_BUSPOUYqcKIUsaOgo'
const PLANT_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjB22ircdBlx_GNILQ0gN3O2iXgRUuHSyAJj6ZSmDePRGwJ5mGmcGE9sfUdHMqqAm0LOzt4oysl82KFgkln5SH7ZAwIgZbVRfOhbeFbvFLEQU9vanMu90dWnBqcloaNPLDt4rSG5n8Tr2Pf9ydIZh78rv9b-N_d9SpN9y_00Lu5unBcDsnZEHwjgZ4dEyadWZ2kz2WfR_X9neWbPyUMjKDWGe6q_8mHQRRA4zrWuxi2josl46BzYYsn8dGSEAfSl_CsXgFJrJ-m7d1'
const INTERIOR_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQbt2VoYYBqxHvsq5QvXXFYASV40EayHM3-1fXg0xfYnchnOInLgi85-7uqssxZ1mxfL4Vwr7765nJ1sYq31odEAqfof4id_df9QX6lwpxAPMeRZOMD3za7mTQG9dF_HV7o2so9UdfmbAPDH721msx5LGUx5vb5eYRPOmAvMfNvD_jUxlvjtPGesLUwFny-mBKa-MHJysOyG12oYy5rOecFX9XWJBFFEXvkuatgOQmLs7suUDH6ZV1XKIqLhPzXK4TerX4IZTI8WgP'

export default function OurStory() {
  return (
    <>
      {/* Hero */}
      <section className="px-8 md:px-32 py-20">
        <div className="max-w-3xl">
          <span className="font-label-caps text-label-caps text-secondary mb-4 block">OUR STORY</span>
          <h1 className="font-['Newsreader'] text-display-lg text-on-surface mb-8">
            Rooted in the <span className="italic text-primary">Texas Hill Country</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Kelston Way Greenhouse is a family-built operation rising from 5 acres of Central Texas land. Founded by Art, Titus, and Samuel Vanwingerden, we're building one of the region's premier commercial greenhouses — targeting a January 2027 opening.
          </p>
        </div>
      </section>

      {/* Image + text */}
      <section className="px-8 md:px-32 py-20 bg-stone-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="relative h-[500px]">
            <div className="absolute top-0 left-0 w-3/4 h-[350px] shape-arch overflow-hidden border border-outline-variant/20 shadow-sm">
              <img src={STORY_IMG} alt="Greenhouse facility" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-1/2 h-[250px] shape-pill overflow-hidden border border-outline-variant/20 shadow-sm">
              <img src={PLANT_IMG} alt="Plants" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <span className="font-label-caps text-label-caps text-secondary mb-4 block">OUR PHILOSOPHY</span>
            <h2 className="font-['Newsreader'] text-headline-xl text-on-surface mb-6">Quality at Commercial Scale</h2>
            <p className="font-body-lg text-on-surface-variant mb-6 leading-relaxed">
              We believe that wholesale doesn't have to mean generic. Every variety we grow is selected for its commercial viability and botanical distinction — rare aroids, drought-tolerant Hill Country species, and consistent top-shelf stock.
            </p>
            <p className="font-body-lg text-on-surface-variant leading-relaxed">
              Our 5-acre facility in Oglesby, Texas is designed from the ground up for professional buyers — efficient loading bays, climate-controlled growing zones, and a team that understands your timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 md:px-32 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { stat: '5 Acres', label: 'Greenhouse Footprint' },
            { stat: 'Jan 2027', label: 'Opening Date' },
            { stat: '3rd Gen', label: 'Nursery Family' },
            { stat: 'Central TX', label: 'Hill Country Location' },
          ].map(({ stat, label }) => (
            <div key={label} className="p-8 border border-outline-variant/30">
              <p className="font-['Newsreader'] text-4xl text-primary mb-2">{stat}</p>
              <p className="font-label-caps text-label-caps text-on-surface-variant">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bento gallery */}
      <section className="px-8 md:px-32 py-20 bg-stone-50">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="font-label-caps text-label-caps text-secondary mb-4 block">THE FAMILY</span>
          <h2 className="font-['Newsreader'] text-headline-xl mb-6">Built Together</h2>
          <div className="w-12 h-[1px] bg-secondary mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-auto md:h-[600px]">
          <div className="relative overflow-hidden bg-stone-100 rounded-sm">
            <img src={STORY_IMG} alt="Facility overview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="font-['Newsreader'] text-3xl mb-2">The Facility</h3>
              <p className="font-body-md opacity-80">Oglesby, Coryell County, Texas</p>
            </div>
          </div>
          <div className="relative overflow-hidden bg-emerald-50 rounded-sm">
            <img src={INTERIOR_IMG} alt="Greenhouse interior" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="font-['Newsreader'] text-3xl mb-2">The Vision</h3>
              <p className="font-body-md opacity-80">Professional grade from day one</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
