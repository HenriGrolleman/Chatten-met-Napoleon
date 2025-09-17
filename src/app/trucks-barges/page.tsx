import TrucksBargesChatBot from '@/components/TrucksBargesChatBot'

export default function TrucksBargesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🚛⛵ Trucks & Barges Reflectiebegeleidng
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Een gestructureerde begeleiding om je ervaring met de serious game <strong>Trucks & Barges</strong> 
            te analyseren en te koppelen aan de theorie uit hoofdstuk 6.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Stap 1: Game-ervaring</h3>
            <p className="text-gray-600 text-sm">
              Analyseer je beslissingen, strategieën en uitdagingen in de game
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Stap 2: Verdieping</h3>
            <p className="text-gray-600 text-sm">
              Kies een onderwerp en verken de theoretische achtergrond
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Stap 3: Inzicht</h3>
            <p className="text-gray-600 text-sm">
              Formuleer een kernachtig inzicht voor je verslag
            </p>
          </div>
        </div>

        {/* Main Chatbot */}
        <TrucksBargesChatBot />

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📚 Theoretische Koppelingen
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Hoofdstuk 6:</strong> Transportplanning en modaliteitskeuze</p>
              <p><strong>DRP-I/II:</strong> Distribution Requirements Planning</p>
              <p><strong>Containerterminals:</strong> Functie en optimalisatie</p>
              <p><strong>Routeplanning:</strong> Verschillende vraagstuktypen</p>
              <p><strong>Onzekerheden:</strong> Omgaan met variabele vraag en aanbod</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}