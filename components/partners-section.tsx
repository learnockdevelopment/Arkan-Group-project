export function PartnersSection() {
  const partners = [
    { name: "Partner 1", logo: "/abstract-logo-1.png" },
    { name: "Partner 2", logo: "/abstract-logo-geometric.png" },
    { name: "Partner 3", logo: "/abstract-logo-design-3.png" },
    { name: "Partner 4", logo: "/abstract-logo-4.png" },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Who works with us?</h2>
          <p className="text-muted-foreground">Trusted by leading companies and institutions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-6 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <img
                src={partner.logo || "/placeholder.svg"}
                alt={partner.name}
                className="max-h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
