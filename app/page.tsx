'use client';

import React, { useRef, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const CATEGORIES = [
  {
    id: 'Physical',
    name: '1. 身体・認知リソース資本',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  {
    id: 'Intellectual',
    name: '2. 知的・技術資本',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
  },
  {
    id: 'Production',
    name: '3. 生産・環境資本',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  {
    id: 'Social',
    name: '4. 社会・関係資本',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
  },
  {
    id: 'Mental',
    name: '5. 精神・自己実現',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
  },
] as const;

const GOAL_OPTIONS = [
  { id: 'Balance', label: '全体的にバランスよく底上げしたい' },
  { id: 'Physical', label: '身体・認知リソースを優先して強化したい' },
  { id: 'Intellectual', label: '知性や専門スキルを優先して磨きたい' },
  { id: 'Production', label: '環境構築や目に見える成果を優先したい' },
  { id: 'Social', label: 'コミュニティや人間関係を優先して広げたい' },
  { id: 'Mental', label: '精神的な余裕・自己実現を優先して深めたい' },
] as const;

const VARIABLES = [
  {
    id: 'q1',
    label:
      '睡眠・回復: 高いパフォーマンスを維持するための睡眠サイクルをコントロールできているか？',
    category: 'Physical',
  },
  {
    id: 'q2',
    label:
      '運動・体力: 日常的な運動を通じて、基礎体力や身体的なタフネスを維持できているか？',
    category: 'Physical',
  },
  {
    id: 'q3',
    label:
      '食事・栄養: 脳や身体のコンディションを最適化するための食事管理ができているか？',
    category: 'Physical',
  },
  {
    id: 'q4',
    label:
      '専門スキル: 自分の武器となる専門的なスキルの学習に時間を投資できているか？',
    category: 'Intellectual',
  },
  {
    id: 'q5',
    label:
      '論理・効率: 感情論ではなく、確率や合理性（期待値）に基づいた選択ができているか？',
    category: 'Intellectual',
  },
  {
    id: 'q6',
    label:
      '体系化・発信: 得た知識や経験を言語化し、外部にアウトプット（定着）できているか？',
    category: 'Intellectual',
  },
  {
    id: 'q7',
    label:
      '長期的プロジェクト: 数ヶ月〜年単位で継続して育てているプロジェクトや資産があるか？',
    category: 'Production',
  },
  {
    id: 'q8',
    label:
      '環境最適化: 自分が最も動きやすいように、物理環境やツールをハック（構築）できているか？',
    category: 'Production',
  },
  {
    id: 'q9',
    label:
      '手触りのある成果: デジタルだけでなく、現実世界で目に見える変化を生み出せているか？',
    category: 'Production',
  },
  {
    id: 'q10',
    label:
      'コミュニティ帰属: 価値観を共有し、心理的に安心できるコミュニティを持てているか？',
    category: 'Social',
  },
  {
    id: 'q11',
    label:
      '仕組み・組織運営: 参加者としてではなく、組織やチームを「回す」側に回れているか？',
    category: 'Social',
  },
  {
    id: 'q12',
    label:
      '他者への貢献: 培ったノウハウを他者にシェアし、課題解決に貢献できているか？',
    category: 'Social',
  },
  {
    id: 'q13',
    label:
      '知的好奇心・没頭: 複雑な課題を読み解き、夢中になって攻略するフロー状態を経験しているか？',
    category: 'Mental',
  },
  {
    id: 'q14',
    label:
      '時間の裁量権: 自分の意志だけで100%自由にコントロールできる可処分時間を確保できているか？',
    category: 'Mental',
  },
  {
    id: 'q15',
    label:
      '心理的ストレス: 人間関係やタスクの重圧がなく、精神的にクリアな状態を保てているか？',
    category: 'Mental',
  },
] as const;

const CATEGORY_IDS = [
  'Physical',
  'Intellectual',
  'Production',
  'Social',
  'Mental',
] as const;

type CategoryId = (typeof CATEGORY_IDS)[number];

const CATEGORY_LABELS: Record<CategoryId, string> = {
  Physical: '身体・認知',
  Intellectual: '知的・技術',
  Production: '生産・環境',
  Social: '社会・関係',
  Mental: '精神・自己実現',
};

const CATEGORY_STYLES: Record<
  CategoryId,
  { text: string; background: string; bar: string }
> = {
  Physical: {
    text: 'text-emerald-700',
    background: 'bg-emerald-50',
    bar: 'bg-emerald-500',
  },
  Intellectual: {
    text: 'text-blue-700',
    background: 'bg-blue-50',
    bar: 'bg-blue-500',
  },
  Production: {
    text: 'text-amber-700',
    background: 'bg-amber-50',
    bar: 'bg-amber-500',
  },
  Social: {
    text: 'text-purple-700',
    background: 'bg-purple-50',
    bar: 'bg-purple-500',
  },
  Mental: {
    text: 'text-rose-700',
    background: 'bg-rose-50',
    bar: 'bg-rose-500',
  },
};

function calculateCategoryScores(
  scores: Record<string, number>
): Record<CategoryId, number> {
  const result: Record<CategoryId, number> = {
    Physical: 0,
    Intellectual: 0,
    Production: 0,
    Social: 0,
    Mental: 0,
  };

  const counts: Record<CategoryId, number> = {
    Physical: 0,
    Intellectual: 0,
    Production: 0,
    Social: 0,
    Mental: 0,
  };

  for (const variable of VARIABLES) {
    const category = variable.category as CategoryId;
    result[category] += scores[variable.id];
    counts[category] += 1;
  }

  for (const category of CATEGORY_IDS) {
    result[category] =
      counts[category] > 0 ? result[category] / counts[category] : 0;
  }

  return result;
}

function calculateCoordinates(categoryScores: Record<CategoryId, number>) {
  const { Physical, Intellectual, Production, Social, Mental } =
    categoryScores;

  const x =
    -0.3 * Physical -
    0.3 * Intellectual -
    0.2 * Mental +
    0.6 * Social +
    0.2 * Production;

  const y =
    -0.5 * Intellectual -
    0.4 * Mental +
    0.4 * Physical +
    0.5 * Production;

  return { x, y };
}

function calculateOverallScore(
  categoryScores: Record<CategoryId, number>
) {
  return (
    CATEGORY_IDS.reduce(
      (total, categoryId) => total + categoryScores[categoryId],
      0
    ) / CATEGORY_IDS.length
  );
}

function getTendencyLabel(x: number, y: number) {
  const horizontal =
    Math.abs(x) < 5 ? '個人・社会のバランス型' : x > 0 ? '社会資本寄り' : '個人資本寄り';
  const vertical =
    Math.abs(y) < 5 ? '思考・実行のバランス型' : y > 0 ? '実行寄り' : '思考寄り';

  return `${horizontal}・${vertical}`;
}

const AFFILIATE_LINKS: Record<
  string,
  { title: string; description: string; url: string }
> = {
  '食事・栄養': {
    title: '📘 脳のパフォーマンスを最大化するロジカル栄養学',
    description:
      '集中力と認知リソースを高く保つための、科学的根拠に基づいた食事術。',
    url: 'https://amazon.co.jp/...',
  },
  '長期的プロジェクト': {
    title: '🌱 環境構築を加速させるプロ仕様ツール',
    description:
      '現実世界で目に見える成果を育てるための、効率的な機材セット。',
    url: 'https://amazon.co.jp/...',
  },
  '論理・効率': {
    title: '🎲 期待値と確率思考を鍛える戦略本',
    description:
      '感情を排し、システムとして合理的な選択をし続けるためのバイブル。',
    url: 'https://amazon.co.jp/...',
  },
};

interface VariableImpact {
  id: string;
  label: string;
  impact: number;
}

interface MapResult {
  x: number;
  y: number;
  action: string;
  targetX: number;
  targetY: number;
}

export default function LifeOptimizationApp() {
  const [scores, setScores] = useState<Record<string, number>>(
    VARIABLES.reduce(
      (acc, variable) => ({ ...acc, [variable.id]: 50 }),
      {} as Record<string, number>
    )
  );
  const [gradient, setGradient] = useState<VariableImpact[]>([]);
  const [aiAdvice, setAiAdvice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mapResult, setMapResult] = useState<MapResult>({
    x: 0,
    y: 0,
    action: '',
    targetX: 0,
    targetY: 0,
  });
  const [selectedGoal, setSelectedGoal] = useState('Balance');
  const chartRef = useRef<any>(null);

  const currentCategoryScores = calculateCategoryScores(scores);
  const currentOverallScore = calculateOverallScore(currentCategoryScores);
  const currentCoordinates = calculateCoordinates(currentCategoryScores);
  const currentTendency = getTendencyLabel(
    currentCoordinates.x,
    currentCoordinates.y
  );
  const evaluationDate = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const handleSliderChange = (id: string, value: string) => {
    setScores((previousScores) => ({
      ...previousScores,
      [id]: Number.parseInt(value, 10),
    }));
  };

  const calculateOptimization = async () => {
    setIsGenerating(true);
    setAiAdvice('');

    const categoryScores = calculateCategoryScores(scores);
    const currentPosition = calculateCoordinates(categoryScores);
    const targetScores: Record<CategoryId, number> = { ...categoryScores };

    if (selectedGoal === 'Balance') {
      for (const categoryId of CATEGORY_IDS) {
        targetScores[categoryId] = 100;
      }
    } else {
      targetScores[selectedGoal as CategoryId] = 100;
    }

    const targetPosition = calculateCoordinates(targetScores);

    const priorities = VARIABLES.map((variable) => {
      const current = scores[variable.id];
      let target = current;

      if (selectedGoal === 'Balance') {
        target = 100;
      } else if (variable.category === selectedGoal) {
        target = 100;
      }

      return {
        id: variable.id,
        label: variable.label.split(':')[0],
        impact: Math.max(0, target - current),
      };
    })
      .filter((item) => item.impact > 0)
      .sort((a, b) => b.impact - a.impact);

    const topAction = priorities[0] ?? {
      id: '',
      label: '現在の状態を維持する',
      impact: 0,
    };

    setMapResult({
      x: currentPosition.x,
      y: currentPosition.y,
      targetX: targetPosition.x,
      targetY: targetPosition.y,
      action: topAction.label,
    });
    setGradient(priorities.slice(0, 3));

    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const response = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryScores,
          coordinates: currentPosition,
          targetCoordinates: targetPosition,
          selectedGoal,
          topAction: topAction.label,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'アドバイスの生成に失敗しました。');
      }

      setAiAdvice(
        data.advice || '現在の状態を維持しながら、小さな改善を続けましょう。'
      );
    } catch (error) {
      console.error('AIアドバイスの取得に失敗しました:', error);
      setAiAdvice(
        'アドバイスの生成に失敗しました。時間をおいて、もう一度お試しください。'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const chartData = {
    datasets: [
      {
        label: '今のあなた（現在地）',
        data: [
          { x: 0, y: 0 },
          { x: mapResult.x, y: mapResult.y },
        ],
        borderColor: 'rgba(79, 70, 229, 0.4)',
        backgroundColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        showLine: true,
        pointRadius: (context: any) => (context.dataIndex === 1 ? 8 : 0),
      },
      {
        label: '次に目指す方向（おすすめルート）',
        data: [
          { x: mapResult.x, y: mapResult.y },
          { x: mapResult.targetX, y: mapResult.targetY },
        ],
        borderColor: 'rgba(236, 72, 153, 1)',
        backgroundColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 3,
        showLine: true,
        pointRadius: (context: any) => (context.dataIndex === 1 ? 6 : 0),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: -100,
        max: 100,
        title: { display: false },
        grid: { color: 'rgba(148, 163, 184, 0.2)' },
      },
      y: {
        min: -100,
        max: 100,
        title: { display: false },
        grid: { color: 'rgba(148, 163, 184, 0.2)' },
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
      <div className="mx-auto max-w-4xl space-y-10 p-6">
        <header className="space-y-4 pt-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
            Life Optimizer
          </h1>
          <p className="text-slate-500">
            性格を分類するのではなく、今の生活資本を可視化して、次の一歩を決めます。
          </p>
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-slate-400">
            この結果は固定的な性格や能力を示すものではありません。
            現在の生活状態を振り返るための自己評価であり、行動や環境によって変化します。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
            <p className="text-sm font-bold text-indigo-700">現在の総合充実度</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-extrabold text-slate-800">
                {Math.round(currentOverallScore)}
              </span>
              <span className="pb-1 text-sm text-slate-400">/ 100</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-indigo-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, currentOverallScore))}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              5資本の単純平均です。高低で人の価値を示すものではなく、
              現在の生活状態を振り返るための目安です。
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-700">今回の状態</p>
            <p className="mt-3 text-lg font-extrabold text-slate-800">
              {currentTendency}
            </p>
            <dl className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between gap-4">
                <dt>評価日</dt>
                <dd className="font-medium text-slate-700">{evaluationDate}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>推奨再評価</dt>
                <dd className="font-medium text-slate-700">1〜2週間後</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              現在の5資本スコア
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              入力した15項目を、5つの資本ごとに集計しています。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {CATEGORY_IDS.map((categoryId) => {
              const value = currentCategoryScores[categoryId];
              const style = CATEGORY_STYLES[categoryId];

              return (
                <div
                  key={categoryId}
                  className={`rounded-2xl border border-slate-200 p-4 shadow-sm ${style.background}`}
                >
                  <p className={`text-xs font-bold ${style.text}`}>
                    {CATEGORY_LABELS[categoryId]}
                  </p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-slate-800">
                      {Math.round(value)}
                    </span>
                    <span className="pb-1 text-xs text-slate-400">/ 100</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${style.bar}`}
                      style={{
                        width: `${Math.max(0, Math.min(100, value))}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {mapResult.action && (
          <div className="animate-fade-in-down space-y-8">
            <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-center text-white shadow-xl">
              <h2 className="mb-2 text-lg font-medium opacity-90">
                今週の改善プランで、最初に取り組むアクションは
              </h2>
              <p className="py-4 text-4xl font-bold tracking-wider text-emerald-400">
                『{mapResult.action}』
              </p>
              <div className="mx-auto grid max-w-xl grid-cols-3 gap-2 text-left text-xs">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-slate-400">期間</p>
                  <p className="mt-1 font-bold text-white">まず7日間</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-slate-400">進め方</p>
                  <p className="mt-1 font-bold text-white">小さく1つ</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-slate-400">再評価</p>
                  <p className="mt-1 font-bold text-white">1〜2週間後</p>
                </div>
              </div>

              <div className="mt-6 min-h-[120px] rounded-xl border border-white/20 bg-white/10 p-6 text-left">
                {isGenerating ? (
                  <div className="flex h-full items-center justify-center space-x-2 opacity-70">
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
                      style={{ animationDelay: '300ms' }}
                    />
                    <span className="ml-2 text-sm">
                      ナビゲーターがアドバイスを生成中...
                    </span>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed opacity-95">{aiAdvice}</p>
                )}
              </div>

              {!isGenerating &&
                AFFILIATE_LINKS[mapResult.action] && (
                  <div className="animate-fade-in-up mt-4 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900 to-slate-800 p-5 text-left">
                    <p className="mb-2 text-xs font-bold text-indigo-300">
                      💡 このアクションを助けるおすすめツール
                    </p>
                    <a
                      href={AFFILIATE_LINKS[mapResult.action].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <h4 className="font-bold text-white transition-colors group-hover:text-emerald-400">
                        {AFFILIATE_LINKS[mapResult.action].title}
                      </h4>
                      <p className="mt-1 text-sm text-slate-400">
                        {AFFILIATE_LINKS[mapResult.action].description}
                      </p>
                    </a>
                  </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="h-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-bold text-slate-800">
                  ライフスタイル傾向マップ
                </h3>
                <p className="text-xs text-slate-500">
                  横軸は個人資本から社会資本、縦軸は思考から実行への現在の傾向です。性格タイプの判定ではありません。
                </p>

                <div className="relative mb-4 mt-8">
                  <div
                    className="absolute -left-2 bottom-0 top-0 z-10 flex w-8 flex-col items-center justify-between py-4 text-xs font-bold text-slate-400"
                    style={{ writingMode: 'vertical-rl' }}
                  >
                    <span className="tracking-widest">実行 ↗</span>
                    <span className="tracking-widest">↙ 思考</span>
                  </div>

                  <div className="h-[250px] w-full pl-8">
                    <Scatter
                      ref={chartRef}
                      data={chartData}
                      options={chartOptions}
                    />
                  </div>

                  <div className="mt-2 flex justify-between pl-8 pr-2 text-xs font-bold text-slate-400">
                    <span>← 個人資本</span>
                    <span>社会資本 →</span>
                  </div>

                  <div className="mt-5 flex items-start rounded-lg bg-pink-50 p-3 text-sm text-slate-600">
                    <span className="mr-2 mt-1 inline-block h-3 w-3 flex-shrink-0 rounded-full bg-pink-500" />
                    <div>
                      <b>ピンクの線（次に向かう方向）</b>
                      <br />
                      現在地から、選択した目標に対応する地点へのルートです。
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[350px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-800">
                  優先改善ランキング
                </h3>
                <ul className="space-y-4">
                  {gradient.map((item, index) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                    >
                      <span className="flex items-center text-sm font-bold text-slate-700">
                        <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600">
                          {index + 1}
                        </span>
                        {item.label}
                      </span>
                      <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-600">
                        改善余地 +{Math.round(item.impact)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <hr className="border-slate-200" />

        <div className="space-y-8">
          <div className="mb-12 mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm">
            <h2 className="mb-4 text-center text-xl font-bold text-slate-800">
              次にとるべき方針（目的）を選択
            </h2>
            <select
              value={selectedGoal}
              onChange={(event) => setSelectedGoal(event.target.value)}
              className="mx-auto block w-full rounded-xl border-slate-300 p-3 font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 md:w-2/3"
            >
              {GOAL_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <h2 className="text-center text-2xl font-bold text-slate-700">
            現在の生活状態を振り返る
          </h2>

          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3
                className={`mb-6 rounded-lg px-4 py-2 text-xl font-bold ${category.bg} ${category.color}`}
              >
                {category.name}
              </h3>
              <div className="space-y-8 px-2">
                {VARIABLES.filter(
                  (variable) => variable.category === category.id
                ).map((variable) => (
                  <div key={variable.id} className="space-y-3">
                    <div className="flex items-start justify-between text-sm font-medium text-slate-700">
                      <span className="w-4/5 leading-relaxed">
                        {variable.label}
                      </span>
                      <span className="w-1/5 text-right text-lg font-bold text-slate-400">
                        {scores[variable.id]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span>全くできていない</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={scores[variable.id]}
                        onChange={(event) =>
                          handleSliderChange(variable.id, event.target.value)
                        }
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-slate-700"
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

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white/80 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl justify-end">
          <button
            type="button"
            onClick={calculateOptimization}
            disabled={isGenerating}
            className="rounded-full bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? '計算中...' : '今週の改善プランを作る'}
          </button>
        </div>
      </div>
    </div>
  );
}
