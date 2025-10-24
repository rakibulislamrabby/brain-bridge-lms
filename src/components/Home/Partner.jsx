import React from 'react'

export default function Partner() {
  return (
    <section className="py-12 bg-gray-50">
        <div className="container text-center">
          <p className="text-xl text-gray-600 font-medium mb-8">Trusted by leading publications</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            {["Business Insider", "Wall Street Journal", "CNBC", "Fox", "TechCrunch", "Fortune"].map((publication) => (
              <span key={publication} className="text-sm font-medium text-gray-600">{publication}</span>
            ))}
          </div>
        </div>
      </section>
  )
}
