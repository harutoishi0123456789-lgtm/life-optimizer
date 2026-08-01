// app/api/advice/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // フロントエンドから「軸を構成する要素」も受け取る
    const { pc1, pc2, topAction, axisData } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが設定されていません。' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const prompt = `
あなたはユーザーに寄り添う親身な「ライフナビゲーター」であり、優秀なデータサイエンティストです。
以下のデータをもとに、2つのタスクを実行し、必ず指定されたJSONフォーマットで出力してください。

【タスク1：グラフの軸の命名】
以下の「軸を構成する要素（重み）」から、X軸のマイナス方向・プラス方向、Y軸のマイナス方向・プラス方向がそれぞれどんなライフスタイルを表しているか、直感的にわかる短い名前（10文字以内、例「直感・感覚」「論理・システム」など）をつけてください。
・X軸(PC1)のマイナス要素: ${axisData.pc1Negative}
・X軸(PC1)のプラス要素: ${axisData.pc1Positive}
・Y軸(PC2)のマイナス要素: ${axisData.pc2Negative}
・Y軸(PC2)のプラス要素: ${axisData.pc2Positive}

【タスク2：アドバイスの作成】
・現在のX軸スコア: ${pc1.toFixed(2)}
・現在のY軸スコア: ${pc2.toFixed(2)}
・最優先アクション: 『${topAction}』
このアクションに取り組むことがなぜ人生を豊かにするのか、明日からできる小さな一歩を1つ提案してください。（200文字程度、温かみのある「です・ます調」）

【出力フォーマット（必ず以下のJSONのみを出力してください。Markdown記号等は不要です）】
{
  "xMinus": "X軸マイナス側の名前",
  "xPlus": "X軸プラス側の名前",
  "yMinus": "Y軸マイナス側の名前",
  "yPlus": "Y軸プラス側の名前",
  "advice": "アドバイスのテキスト"
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