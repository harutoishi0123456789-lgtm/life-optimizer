// app/api/advice/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // フロントエンドから「軸を構成する要素」も受け取る
    const { categoryScores, cordinates, selectedGoal, topAction} = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが設定されていません。' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const prompt = `
あなたは人生設計コーチです。

身体資本: ${categoryScores.Physical}
知的資本: ${categoryScores.Intellectual}
生産資本: ${categoryScores.Production}
社会資本: ${categoryScores.Social}
精神資本: ${categoryScores.Mental}

目標:
${selectedGoal}

最優先アクション:
${topAction}

なぜこのアクションが重要なのか、
明日できる最初の一歩を
200文字程度で提案してください。

JSONのみ返してください。

{
  "advice":"..."
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // AIが ```json などのマークダウンをつけて返してきた場合を除去
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(text);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'データの生成に失敗しました。' }, { status: 500 });
  }
}