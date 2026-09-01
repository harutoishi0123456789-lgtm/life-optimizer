'use client';

import React, { useState,useRef } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

// --- 1. Variables Definition ---
const CATEGORIES = [
  { id: 'Physical', name: '1. 身体・認知リソース資本', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { id: 'Intellectual', name: '2. 知的・技術資本', color: 'text-blue-700', bg: 'bg-blue-50' },
  { id: 'Production', name: '3. 生産・環境資本', color: 'text-amber-700', bg: 'bg-amber-50' },
  { id: 'Social', name: '4. 社会・関係資本', color: 'text-purple-700', bg: 'bg-purple-50' },
  { id: 'Mental', name: '5. 精神・自己実現', color: 'text-rose-700', bg: 'bg-rose-50' },
];

const GOAL_OPTIONS = [
  { id: 'Balance', label: '全体的にバランスよく底上げしたい' },
  { id: 'Physical', label: '身体・認知リソースを優先して強化したい' },
  { id: 'Intellectual', label: '知性や専門スキルを優先して磨きたい' },
  { id: 'Production', label: '環境構築や目に見える成果を優先したい' },
  { id: 'Social', label: 'コミュニティや人間関係を優先して広げたい' },
  { id: 'Mental', label: '精神的な余裕・自己実現を優先して深めたい' }
];

const VARIABLES = [
  { id: 'q1', label: '睡眠・回復: 高いパフォーマンスを維持するための睡眠サイクルをコントロールできているか？', category: 'Physical' },
  { id: 'q2', label: '運動・体力: 日常的な運動を通じて、基礎体力や身体的なタフネスを維持できているか？', category: 'Physical' },
  { id: 'q3', label: '食事・栄養: 脳や身体のコンディションを最適化するための食事管理ができているか？', category: 'Physical' },
  { id: 'q4', label: '専門スキル: 自分の武器となる専門的なスキルの学習に時間を投資できているか？', category: 'Intellectual' },
  { id: 'q5', label: '論理・効率: 感情論ではなく、確率や合理性（期待値）に基づいた選択ができているか？', category: 'Intellectual' },
  { id: 'q6', label: '体系化・発信: 得た知識や経験を言語化し、外部にアウトプット（定着）できているか？', category: 'Intellectual' },
  { id: 'q7', label: '長期的プロジェクト: 数ヶ月〜年単位で継続して育てているプロジェクトや資産があるか？', category: 'Production' },
  { id: 'q8', label: '環境最適化: 自分が最も動きやすいように、物理環境やツールをハック（構築）できているか？', category: 'Production' },
  { id: 'q9', label: '手触りのある成果: デジタルだけでなく、現実世界で目に見える変化を生み出せているか？', category: 'Production' },
  { id: 'q10', label: 'コミュニティ帰属: 価値観を共有し、心理的に安心できるコミュニティを持てているか？', category: 'Social' },
  { id: 'q11', label: '仕組み・組織運営: 参加者としてではなく、組織やチームを「回す」側に回れているか？', category: 'Social' },
  { id: 'q12', label: '他者への貢献: 培ったノウハウを他者にシェアし、課題解決に貢献できているか？', category: 'Social' },
  { id: 'q13', label: '知的好奇心・没頭: 複雑な課題を読み解き、夢中になって攻略するフロー状態を経験しているか？', category: 'Mental' },
  { id: 'q14', label: '時間の裁量権: 自分の意志だけで100%自由にコントロールできる可処分時間を確保できているか？', category: 'Mental' },
  { id: 'q15', label: '心理的ストレス: 人間関係やタスクの重圧がなく、精神的にクリアな状態を保てているか？', category: 'Mental' },
];

const CATEGORY_IDS = [
  'Physical',
  'Intellectual',
  'Production',
  'Social',
  'Mental'
] as const;

type CategoryId = typeof CATEGORY_IDS[number];

function calculateCategoryScores(
  scores: Record<string, number>
): Record<CategoryId, number> {
  const result = {
    Physical: 0,
    Intellectual: 0,
    Production: 0,
    Social: 0,
    Mental: 0,
  };

  const counts = {
    Physical: 0,
    Intellectual: 0,
    Production: 0,
    Social: 0,
    Mental: 0,
  };

  for (const v of VARIABLES) {
    result[v.category as CategoryId] += scores[v.id];
    counts[v.category as CategoryId]++;
  }

  for (const category of CATEGORY_IDS) {
    result[category] /= counts[category];
  }

  return result;
}

function calculateCoordinates(
  categoryScores: Record<CategoryId, number>
) {
  const {
    Physical,
    Intellectual,
    Production,
    Social,
    Mental
  } = categoryScores;

  const x =
    -0.3 * Physical
    -0.3 * Intellectual
    -0.2 * Mental
    +0.6 * Social
    +0.2 * Production;

  const y =
    -0.5 * Intellectual
    -0.4 * Mental
    +0.4 * Physical
    +0.5 * Production;

  return { x, y };
}

// ▼ 追加: アクションに応じたおすすめ商品データ
const AFFILIATE_LINKS: Record<string, { title: string, description: string, url: string }> = {
  '食事・栄養': {
    title: '📘 脳のパフォーマンスを最大化するロジカル栄養学',
    description: '集中力と認知リソースを高く保つための、科学的根拠に基づいた食事術。',
    url: 'https://amazon.co.jp/...' // 実際のアフィリエイトリンクに差し替えます
  },
  '長期的プロジェクト': {
    title: '🌱 環境構築を加速させるプロ仕様ツール',
    description: '現実世界で目に見える成果を育てるための、効率的な機材セット。',
    url: 'https://amazon.co.jp/...'
  },
  '論理・効率': {
    title: '🎲 期待値と確率思考を鍛える戦略本',
    description: '感情を排し、システムとして合理的な選択をし続けるためのバイブル。',
    url: 'https://amazon.co.jp/...'
  },
  // ...必要に応じて他の項目も追加...
};

interface VariableImpact {
  id: string;
  label: string;
  impact: number;
}

export default function LifeOptimizationApp() {
  const [scores, setScores] = useState<Record<string, number>>(
    VARIABLES.reduce((acc, v) => ({ ...acc, [v.id]: 50 }), {} as Record<string, number>)
  );
  
  const [gradient, setGradient] = useState<VariableImpact[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [axisLabels] = useState({ 
    xMinus: '個人資本', xPlus: '社会資本', 
    yMinus: '思考', yPlus: '実行' 
  });
  const [mapResult, setMapResult] = useState({
  x: 0,
  y: 0,
  action: '',
  targetX: 0,
  targetY: 0,
});
  const chartRef = useRef<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<string>('Balance');

  const handleSliderChange = (id: string, value: string) => {
    setScores(prev => ({ ...prev, [id]: parseInt(value) }));
  };

  const calculateOptimization = async () => {
    setIsGenerating(true);
    setAiAdvice('');

    const categoryScores =
      calculateCategoryScores(scores);

    const currentPosition =
      calculateCoordinates(categoryScores);

    const targetScores = {
      ...categoryScores
    };

    if (selectedGoal === 'Balance') {
      CATEGORY_IDS.forEach(id => {
        targetScores[id] = 100;
      });
    } else {
      targetScores[
        selectedGoal as CategoryId
      ] = 100;
    }

    const targetPosition =
      calculateCoordinates(targetScores);

    const priorities = VARIABLES.map(v => {

      const current = scores[v.id];

      let target = current;

      if (selectedGoal === 'Balance') {
        target = 100;
      } else if (
        v.category === selectedGoal
      ) {
        target = 100;
      }

      return {
        id: v.id,
        label: v.label.split(':')[0],
        impact: Math.max(
          0,
          target - current
        )
      };

    }).sort((a, b) => b.impact - a.impact);

    const topAction =
      priorities[0];

    setMapResult({
      x: currentPosition.x,
      y: currentPosition.y,
      targetX: targetPosition.x,
      targetY: targetPosition.y,
      action: topAction.label
    });

    setGradient(
      priorities.slice(0, 3)
    );

    window.scrollTo({
  top: 0,
  behavior: 'smooth'
});

try {
  const response = await fetch('/api/advice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      categoryScores,
      coordinates: currentPosition,
      targetCoordinates: targetPosition,
      selectedGoal,
      topAction: topAction.label
    })
  });

  const data = await response.json();

  if (data.advice) {
    setAiAdvice(data.advice);
  }

} catch (error) {

  console.error(error);

  setAiAdvice(
    'アドバイスの生成に失敗しました。'
  );

} finally {

  setIsGenerating(false);

}
  };

  // ▼ 追加: グラフクリック時の座標取得処理
  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const chart = chartRef.current;
    if (!chart || isGenerating) return; // 解析中は連続クリック防止

    // クリックした位置のピクセル座標を取得
    const rect = chart.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // ピクセル座標を、グラフ内のデータ座標（PC1, PC2）に変換
    const dataX = chart.scales.x.getValueForPixel(x);
    const dataY = chart.scales.y.getValueForPixel(y);

    if (dataX !== undefined && dataY !== undefined) {
      // 変換した座標を目的地にして再計算！
      calculateOptimization();
    }
  };

  // ▼ 変更: グラフのデータ（目標ベクトルの描画先をタップ地点にする）
  const chartData = {
    datasets: [
      {
        label: '今のあなた（現在地）',
        data: [{ x: 0, y: 0 }, { x: mapResult.x, y: mapResult.y }],
        borderColor: 'rgba(79, 70, 229, 0.4)', 
        backgroundColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        showLine: true,
        pointRadius: (context: any) => context.dataIndex === 1 ? 8 : 0,
      },
      {
        label: '次に目指す方向（おすすめルート）',
        data: [
          { x: mapResult.x, y: mapResult.y }, 
          { x: mapResult.targetX, y: mapResult.targetY } // ▼ 変更: 目標地点に線を引く
        ],
        borderColor: 'rgba(236, 72, 153, 1)', 
        borderWidth: 3,
        showLine: true,
        pointRadius: 0,
      }
    ],
  };

  

  // ▼ chartOptions の scales.x.title と scales.y.title を非表示（false）にする
  const chartOptions = {
    scales: {
      x: { title: { display: false } }, // display: false に変更
      y: { title: { display: false } }  // display: false に変更
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-10">
        
        <header className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Life Optimizer</h1>
          <p className="text-slate-500">人生の多次元パラメーターを評価し、次に打つべき最適解を導き出します。</p>
        </header>

        {mapResult.action && (
          <div className="space-y-8 animate-fade-in-down">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl text-center">
              <h2 className="text-lg font-medium opacity-90 mb-2">目的関数を最大化するために、今取り組むべきレバレッジポイントは</h2>
              <p className="text-4xl font-bold tracking-wider py-4 text-emerald-400">『{mapResult.action}』</p>
              <div className="mt-6 bg-white/10 p-6 rounded-xl text-left border border-white/20 min-h-[120px]">
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2 h-full opacity-70">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <span className="ml-2 text-sm">ナビゲーターがアドバイスを生成中...</span>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed opacity-95">
                    {aiAdvice}
                  </p>
                )}
              </div>

              {/* ▼ 追加: アフィリエイト提案エリア */}
              {!isGenerating && mapResult.action && AFFILIATE_LINKS[mapResult.action] && (
                <div className="mt-4 p-5 bg-gradient-to-br from-indigo-900 to-slate-800 rounded-xl border border-indigo-500/30 text-left animate-fade-in-up">
                  <p className="text-xs font-bold text-indigo-300 mb-2">💡 このアクションを助けるおすすめツール</p>
                  <a 
                    href={AFFILIATE_LINKS[mapResult.action].url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h4 className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                      {AFFILIATE_LINKS[mapResult.action].title}
                    </h4>
                    <p className="text-sm text-slate-400 mt-1">
                      {AFFILIATE_LINKS[mapResult.action].description}
                    </p>
                  </a>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-auto">
                <h3 className="text-lg font-bold text-slate-800 mb-2">あなたの人生ステータスマップ</h3>
                
                {/* グラフとラベルを囲むコンテナ */}
                <div className="relative mt-8 mb-4">
                  
                  {/* Y軸（縦）のラベル（左側に配置、縦書き） */}
                  <div className="absolute -left-2 top-0 bottom-0 w-8 flex flex-col justify-between items-center py-4 text-xs font-bold text-slate-400 z-10" style={{ writingMode: 'vertical-rl' }}>
                    <span className="tracking-widest">{axisLabels.yPlus} ↗</span>
                    <span className="tracking-widest">↙ {axisLabels.yMinus}</span>
                  </div>

                  {/* グラフ本体（左側に余白を空ける） */}
                  <div className="h-[250px] w-full pl-8">
                    <Scatter 
                      ref={chartRef} 
                      data={chartData} 
                      options={chartOptions} 
                      onClick={handleChartClick}
                      className={isGenerating ? "opacity-50 cursor-not-allowed" : "cursor-crosshair"}
                    />
                  </div>

                  {/* X軸（横）のラベル（グラフの下に配置） */}
                  <div className="flex justify-between pl-8 pr-2 mt-2 text-xs font-bold text-slate-400">
                    <span>← {axisLabels.xMinus}</span>
                    <span>{axisLabels.xPlus} →</span>
                  </div>
                  <li className="flex items-start">
                      <span className="inline-block w-3 h-3 bg-pink-500 rounded-full mr-2 mt-1 flex-shrink-0"></span>
                      <div>
                        <b>ピンクの線（次に向かうべき方向）</b><br/>
                        ここから一番効率よく目的地へ向かうルートです。<br/>
                        <span className="text-pink-600 font-bold bg-pink-50 px-1 rounded">✨ グラフ内をタップして、自分が行きたい「目標地点」を自由に変更できます！</span>
                      </div>
                    </li>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-[350px] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-800 mb-4">影響度ランキング (Gradient Impact)</h3>
                <ul className="space-y-4">
                  {gradient.map((g, idx) => (
                    <li key={g.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="flex items-center text-sm font-bold text-slate-700">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mr-3 text-xs">{idx + 1}</span>
                        {g.label}
                      </span>
                      <span className="font-mono text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded text-xs">+{g.impact.toFixed(3)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <hr className="border-slate-200" />

        <div className="space-y-8">
          
          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 shadow-sm mt-4 mb-12">
            <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">次にとるべき方針（目的）を選択</h2>
            <select 
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="w-full md:w-2/3 mx-auto block p-3 rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-slate-700 font-medium"
            >
              {GOAL_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-700">現在のパラメーターを入力</h2>
          
          {CATEGORIES.map(category => (
            <div key={category.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className={`text-xl font-bold mb-6 px-4 py-2 rounded-lg ${category.bg} ${category.color}`}>
                {category.name}
              </h3>
              <div className="space-y-8 px-2">
                {VARIABLES.filter(v => v.category === category.id).map(v => (
                  <div key={v.id} className="space-y-3">
                    <div className="flex justify-between items-start text-sm font-medium text-slate-700">
                      <span className="w-4/5 leading-relaxed">{v.label}</span>
                      <span className="text-lg font-bold text-slate-400 w-1/5 text-right">{scores[v.id]}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span>全くできていない</span>
                      <input 
                        type="range" min="0" max="100" 
                        value={scores[v.id]} 
                        onChange={(e) => handleSliderChange(v.id, e.target.value)}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                      />
                      <span>理想的に機能</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button 
            onClick={calculateOptimization}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            最適化を計算する (Execute Optimization)
          </button>
        </div>
      </div>
    </div>
  );
}