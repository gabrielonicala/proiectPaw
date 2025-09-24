import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { originalText } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      // Return basic analysis when no API key is configured
      return NextResponse.json({
        success: true,
        analysis: {
          people: '1-2 people',
          activity: 'general activity',
          setting: 'general location',
          mood: 'neutral',
          content: 'none',
          keyElements: ['general scene'],
          emotions: ['neutral']
        }
      });
    }

    const analysisPrompt = `Analyze this journal entry and extract key information for image generation:

"${originalText}"

Please provide a JSON response with the following structure:
{
  "people": "exact number and type of people (e.g., '1 person', '2-3 friends', '3+ people', 'family members')",
  "activity": "main activity being described (e.g., 'watching anime', 'hanging out with friends', 'working', 'studying')",
  "setting": "location or environment (e.g., 'at home', 'in a park', 'at work', 'outdoors')",
  "mood": "emotional tone (e.g., 'happy/joyful', 'sad/melancholy', 'excited/energetic', 'calm/peaceful', 'stressed/anxious')",
  "content": "specific media, shows, games, or topics mentioned (e.g., 'Naruto anime', 'Netflix series', 'video games', 'none')",
  "keyElements": ["list", "of", "important", "visual", "elements", "to", "include"],
  "emotions": ["list", "of", "emotions", "to", "convey"]
}

Focus on:
- Counting people accurately (look for plural forms, group words, etc.)
- Identifying the main activity (even if it's just watching, reading, etc.)
- Understanding the emotional context
- Extracting any specific content references (anime, movies, games, etc.)
- Identifying visual elements that should appear in the image

Respond with ONLY the JSON object, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert at analyzing text for image generation. Always respond with valid JSON only." },
        { role: "user", content: analysisPrompt }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const analysisText = completion.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis response from OpenAI');
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      console.error('Failed to parse analysis JSON:', analysisText);
      throw new Error('Invalid JSON response from analysis');
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Text analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}
