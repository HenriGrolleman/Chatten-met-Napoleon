'use client'

import { useState, useRef, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import ResponseActions from './ResponseActions'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface GameSession {
  phase: 'start' | 'deepening' | 'conclusion' | 'completed'
  iteration: number
  selectedTopic?: string
  insights: string[]
}

export default function TrucksBargesChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [gameSession, setGameSession] = useState<GameSession>({
    phase: 'start',
    iteration: 0,
    insights: []
  })
  const [showTopicSelection, setShowTopicSelection] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Verdiepingsonderwerpen
  const deepeningTopics = [
    {
      id: 'containerterminal',
      title: 'Containerterminal: definitie en functie',
      description: 'Onderzoek wat een containerterminal precies is en welke rol het speelt'
    },
    {
      id: 'drp',
      title: 'Relatie met DRP-I & DRP-II',
      description: 'Verbind de game-ervaring met Distribution Requirements Planning'
    },
    {
      id: 'routeplanning',
      title: 'Routeplanprobleem: welk type past bij dit vraagstuk?',
      description: 'Analyseer welk type routeplanprobleem van toepassing is'
    },
    {
      id: 'vestigingslocatie',
      title: 'Optimale vestigingslocatie van een terminal',
      description: 'Welke variabelen spelen mee bij locatiekeuze?'
    },
    {
      id: 'dienstverlening',
      title: 'Logistieke dienstverlening',
      description: 'Hoe zou je een containerterminal typeren en waarom?'
    },
    {
      id: 'onzekerheden',
      title: 'Onzekerheden in aanbod en vraag',
      description: 'Omgaan met onzekerheden in containeraanbod of klantvraag'
    },
    {
      id: 'verladersperspectief',
      title: 'Verladersperspectief',
      description: 'Hoe interessant is scheepvaart voor kleine ondernemingen?'
    }
  ]

  // Scroll naar beneden bij nieuwe berichten
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Welkomstbericht bij eerste load
  useEffect(() => {
    if (messages.length === 0) {
      addAssistantMessage(getWelcomeMessage())
    }
  }, [])

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addAssistantMessage = (content: string) => {
    addMessage('assistant', content)
  }

  const getWelcomeMessage = () => {
    return `# 🚛⛵ Welkom bij de Trucks & Barges Reflectiebegeleidng!

Hoi! Ik ben hier om je te helpen reflecteren op je ervaring met de serious game **Trucks & Barges**. 

We gaan samen in **3 stappen** je spelervaring analyseren en koppelen aan de theorie uit hoofdstuk 6:

**📋 Stap 1:** Jouw game-ervaring en beslissingen
**🔍 Stap 2:** Verdieping in een specifiek onderwerp  
**💡 Stap 3:** Kernachtig inzicht voor je verslag

Laten we beginnen! 

**Beschrijf kort hoe jij beslissingen hebt genomen in de game Trucks & Barges. Welke factoren vond je het belangrijkst (bijv. kosten, tijd, benutting van modaliteiten)?**`
  }

  const getPhasePrompt = () => {
    const { phase, iteration } = gameSession

    if (phase === 'start') {
      const startPrompts = [
        "Beschrijf kort hoe jij beslissingen hebt genomen in de game Trucks & Barges. Welke factoren vond je het belangrijkst (bijv. kosten, tijd, benutting van modaliteiten)?",
        "Wat werkte goed in jullie aanpak?",
        "Waar liep je tegenaan?",
        "Welke elementen uit paragraaf 6.4 van de literatuur zie je nauwelijks terug als afweging in de game?"
      ]
      return startPrompts[Math.min(iteration, startPrompts.length - 1)]
    }

    if (phase === 'deepening') {
      return "Vertel me meer over je gekozen onderwerp. Wat vind je het meest interessant of uitdagend?"
    }

    if (phase === 'conclusion') {
      return "Kun je in één zin jouw belangrijkste inzicht uit de game en dit onderwerp samenvatten?"
    }

    return ""
  }

  const getFollowUpQuestions = (topic: string) => {
    const generalQuestions = [
      "Wat zou er gebeuren als dit besluit verkeerd uitpakt?",
      "Hoe zou dit anders zijn bij een groot internationaal bedrijf dan bij een lokaal bedrijf?",
      "Welke keuze zou jij zelf maken, en waarom?",
      "Hoe hangt dit samen met wat je in hoofdstuk 6 hebt gelezen?",
      "Hoe denk je dat dit over 10 jaar anders zou zijn door automatisering of duurzaamheid?"
    ]

    const specificQuestions: { [key: string]: string[] } = {
      verladersperspectief: [
        "Welke extra kosten, risico's of logistieke stappen komen erbij kijken voor een kleine onderneming die wil verschepen via een barge?",
        "Welke schaalvoordelen of nadelen zie je voor een verlader bij de keuze tussen truck en schip?",
        "Welke rol spelen betrouwbaarheid en flexibiliteit bij deze keuze?"
      ]
    }

    const topicQuestions = specificQuestions[topic] || []
    return [...topicQuestions, ...generalQuestions]
  }

  const generateAIResponse = async (userMessage: string) => {
    const { phase, iteration, selectedTopic } = gameSession

    // Systeem prompt voor de AI
    let systemPrompt = `Je bent een warme, nieuwsgierige en prikkelende begeleider voor studenten die reflecteren op de serious game Trucks & Barges. 

CONTEXT:
- Fase: ${phase}
- Iteratie: ${iteration + 1}/3
- Gekozen onderwerp: ${selectedTopic || 'nog niet gekozen'}

STIJL:
- Vriendelijk, uitnodigend, kort en concreet
- Maximaal 3 iteraties per fase
- Combineer praktijkgerichte vragen met theoretische koppelingen
- Focus op transportplanning, containerterminals, DRP, routeplanning, onzekerheden

DOEL HUIDIGE FASE:`

    if (phase === 'start') {
      systemPrompt += `
- Help de student hun spelervaring samen te vatten
- Koppel aan transportplanning (kosten, tijd, benutting modaliteiten)
- Stimuleer reflectie op anticiperend plannen onder onzekerheid
- Na max 3 iteraties, leid over naar verdiepingskeuze`
    } else if (phase === 'deepening') {
      systemPrompt += `
- Verdiep het gekozen onderwerp: ${selectedTopic}
- Stel prikkelende doorvragen
- Koppel aan hoofdstuk 6 literatuur waar relevant
- Na max 3 iteraties, leid over naar conclusie`
    } else if (phase === 'conclusion') {
      systemPrompt += `
- Help de student een kernachtig inzicht formuleren
- Sluit af met bruikbare conclusie voor verslag/nabespreking`
    }

    const payload = {
      message: `${systemPrompt}\n\nStudent antwoord: "${userMessage}"`,
      // Gebruik altijd Gemini 2.5 Flash
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('AI response failed')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('AI Error:', error)
      return "Sorry, er ging iets mis. Kun je je antwoord nog een keer proberen?"
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    addMessage('user', userMessage)
    setIsLoading(true)

    try {
      // Genereer AI response
      const aiResponse = await generateAIResponse(userMessage)
      addAssistantMessage(aiResponse)

      // Update game session state
      const newIteration = gameSession.iteration + 1
      
      if (gameSession.phase === 'start' && newIteration >= 3) {
        // Na 3 iteraties in start fase, ga naar topic selectie
        setGameSession(prev => ({
          ...prev,
          phase: 'deepening',
          iteration: 0
        }))
        setShowTopicSelection(true)
      } else if (gameSession.phase === 'deepening' && newIteration >= 3) {
        // Na 3 iteraties in deepening fase, ga naar conclusie
        setGameSession(prev => ({
          ...prev,
          phase: 'conclusion',
          iteration: 0
        }))
      } else if (gameSession.phase === 'conclusion') {
        // Na conclusie, sessie voltooid
        setGameSession(prev => ({
          ...prev,
          phase: 'completed',
          insights: [...prev.insights, userMessage]
        }))
        
        // Voeg afsluitend bericht toe
        setTimeout(() => {
          addAssistantMessage("🎉 **Mooi, je reflectie is nu helder en verdiept!** \n\nGebruik dit als basis voor je verslag of voorbereiding op de nabespreking in de les. Succes met je verdere studie!")
        }, 1000)
      } else {
        // Verhoog iteratie binnen huidige fase
        setGameSession(prev => ({
          ...prev,
          iteration: newIteration
        }))
      }

    } catch (error) {
      addAssistantMessage("Sorry, er ging iets mis. Probeer het nog een keer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTopicSelection = (topicId: string) => {
    const topic = deepeningTopics.find(t => t.id === topicId)
    if (!topic) return

    setGameSession(prev => ({
      ...prev,
      selectedTopic: topicId,
      iteration: 0
    }))
    setShowTopicSelection(false)

    // Voeg topic selectie toe als user message
    addMessage('user', `Ik kies voor: ${topic.title}`)

    // Genereer eerste verdiepingsvraag
    setTimeout(async () => {
      setIsLoading(true)
      const deepeningPrompt = `De student heeft gekozen voor het onderwerp "${topic.title}". 
      
Stel nu een prikkelende openingsvraag over dit onderwerp die aansluit bij hun game-ervaring met Trucks & Barges. Koppel het aan de theorie uit hoofdstuk 6 waar relevant.

Onderwerp: ${topic.description}`

      try {
        const response = await generateAIResponse(deepeningPrompt)
        addAssistantMessage(response)
      } catch (error) {
        addAssistantMessage("Vertel me meer over dit onderwerp. Wat vind je het meest interessant of uitdagend?")
      } finally {
        setIsLoading(false)
      }
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const resetSession = () => {
    setMessages([])
    setGameSession({
      phase: 'start',
      iteration: 0,
      insights: []
    })
    setShowTopicSelection(false)
    setTimeout(() => {
      addAssistantMessage(getWelcomeMessage())
    }, 100)
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              🚛⛵ Trucks & Barges Reflectiebegeleidng
            </h1>
            <p className="text-blue-100 mt-1">
              Fase {gameSession.phase === 'start' ? '1' : gameSession.phase === 'deepening' ? '2' : '3'}/3 
              {gameSession.phase !== 'completed' && ` • Iteratie ${gameSession.iteration + 1}/3`}
            </p>
          </div>
          <button
            onClick={resetSession}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
            title="Start nieuwe sessie"
          >
            🔄 Opnieuw
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500"
          style={{ 
            width: gameSession.phase === 'start' ? '33%' : 
                   gameSession.phase === 'deepening' ? '66%' : '100%' 
          }}
        />
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.role === 'assistant' ? (
                <div>
                  <MarkdownRenderer content={message.content} />
                  <ResponseActions 
                    content={message.content}
                    isMarkdown={true}
                    className="mt-2"
                  />
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-gray-600 text-sm">Ik denk na...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Topic Selection Modal */}
      {showTopicSelection && (
        <div className="border-t border-gray-200 p-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🔍 Kies een verdiepingsonderwerp:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deepeningTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelection(topic.id)}
                className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <h4 className="font-medium text-gray-800 mb-1">{topic.title}</h4>
                <p className="text-sm text-gray-600">{topic.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      {gameSession.phase !== 'completed' && !showTopicSelection && (
        <div className="border-t border-gray-200 p-6">
          <div className="flex space-x-4">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Typ je antwoord hier... (Enter om te verzenden)"
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
          
          {/* Phase indicator */}
          <div className="mt-3 text-sm text-gray-500 text-center">
            {gameSession.phase === 'start' && "💭 Vertel over je game-ervaring"}
            {gameSession.phase === 'deepening' && "🔍 Verdiep je gekozen onderwerp"}
            {gameSession.phase === 'conclusion' && "💡 Formuleer je kernachtige inzicht"}
          </div>
        </div>
      )}
    </div>
  )
}