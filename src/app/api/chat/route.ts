import { GoogleGenerativeAI, Tool } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Initialiseer de Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Helper functie om base64 naar buffer te converteren
function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

// Google Search tool configuratie
const googleSearchTool = {
  googleSearch: {}
}

export async function POST(request: NextRequest) {
  try {
    // Betere error handling voor Netlify
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { 
          error: 'API configuratie ontbreekt. Check Netlify Environment Variables.',
          hint: 'Voeg GEMINI_API_KEY toe in Netlify Site Settings → Environment Variables',
          debug: 'Environment variable GEMINI_API_KEY is not set'
        }, 
        { status: 500 }
      )
    }

    // Haal de bericht data op uit de request
    const body = await request.json()
    console.log('Received request body:', body)
    
    const { message, image, images } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Bericht is vereist' },
        { status: 400 }
      )
    }

    // Input validatie en sanitization
    if (typeof message !== 'string' || message.length > 100000) {
      return NextResponse.json(
        { error: 'Bericht moet een string zijn van maximaal 100.000 karakters' },
        { status: 400 }
      )
    }

    // Gebruik altijd Gemini 2.5 Flash
    const modelName = 'gemini-2.5-flash-preview-05-20'
    const model = genAI.getGenerativeModel({ model: modelName })

    let result;
    
    if (images && images.length > 0) {
      // Meerdere afbeeldingen - gebruik nieuwe images array
      const imageParts = images.map((imageData: string) => {
        const imageBuffer = base64ToBuffer(imageData)
        return {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: 'image/jpeg'
          }
        }
      })
      
      result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: message }, ...imageParts] }]
      })
    } else if (image) {
      // Backward compatibility - één afbeelding (legacy)
      const imageBuffer = base64ToBuffer(image)
      
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: 'image/jpeg'
        }
      }
      
      result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: message }, imagePart] }]
      })
    } else {
      // Alleen tekst
      result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: message }] }]
      })
    }

    const response = await result.response
    const text = response.text()


    return NextResponse.json({ 
      response: text,
      success: true
    })

  } catch (error) {
    console.error('Fout bij het aanroepen van Gemini API:', error)
    
    // Betere error information voor debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Er is een fout opgetreden bij het verwerken van je bericht',
        details: errorMessage,
        timestamp: new Date().toISOString(),
        hint: 'Check Netlify Function logs voor meer details'
      },
      { status: 500 }
    )
  }
} 