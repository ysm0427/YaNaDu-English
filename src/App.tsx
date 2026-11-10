import { useState } from 'react';

const categories = [
  { id: 'cafe', title: '☕ 주말 카페 스몰톡', level: '일상 회화' },
  { id: 'meeting', title: '📊 비즈니스 미팅 & 보고', level: '고급 실무' },
  { id: 'travel', title: '✈️ 해외여행 공항/호텔', level: '필수 스몰톡' },
  { id: 'pet', title: '🐱 반려동물(고양이) 케어', level: '일상 & 전문' },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* 왼쪽 사이드바 (주제 선택 메뉴) */}
      <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-yellow-400">🔥 나만의 야나두 PRO</h1>
          <p className="text-xs text-gray-400 mt-1">아이패드 맞춤형 영어 학습 플랫폼</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 px-3 mb-2">📚 학습 카테고리 선택</p>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                selectedCategory.id === cat.id
                  ? 'bg-blue-600 text-white font-semibold shadow-lg'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <div className="text-sm">{cat.title}</div>
              <div className="text-xs opacity-75 mt-0.5">{cat.level}</div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700 text-xs text-gray-400 text-center">
          Mode: iPad Split View Optimized
        </div>
      </aside>

      {/* 우측 메인 강의 화면 */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-md">
            <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
              {selectedCategory.level}
            </span>
            <h2 className="text-2xl font-bold mt-3 text-white">{selectedCategory.title}</h2>
            <p className="text-gray-300 text-sm mt-2">
              원어민이 가장 자주 쓰는 만능 패턴과 16개 품사/성분 구조를 결합하여 완벽하게 체화합니다.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">🧩 STEP 1. 오늘의 야나두 만능 패턴</h3>
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 text-lg font-mono text-blue-300">
              I was wondering if you could ~ [🔊 듣기]
            </div>
            <p className="text-sm text-gray-300 mt-3">
              💬 직설적인 부탁보다 훨씬 정중하고 부드럽게 상대방의 협조를 구할 때 사용하는 패턴입니다.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">📚 STEP 2. 일상 & 고급 짝꿍 단어장 (10 Words)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="pb-3">구분</th>
                    <th className="pb-3">단어 & 발음</th>
                    <th className="pb-3">뜻 (품사)</th>
                    <th className="pb-3">실전 짝꿍 표현 (Collocation)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  <tr>
                    <td className="py-3 text-blue-400 font-medium">일상 회화</td>
                    <td className="py-3 font-bold text-white">grab <span className="text-xs text-gray-400">[그랩]</span></td>
                    <td className="py-3 text-gray-300">잡다, 먹다 (동사)</td>
                    <td className="py-3 text-gray-300">grab a coffee (커피 한잔하다)</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-purple-400 font-medium">고급 실무</td>
                    <td className="py-3 font-bold text-white">streamline <span className="text-xs text-gray-400">[스트림라인]</span></td>
                    <td className="py-3 text-gray-300">간소화하다 (동사)</td>
                    <td className="py-3 text-gray-300">streamline the process (공정 간소화)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">🔍 STEP 3. 문장 성분(직책) × 9품사(신분) 해부 노트</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                <span className="text-xs text-blue-400 font-bold">Word: grab</span>
                <p className="text-sm font-semibold mt-1">품사: 동사 (Verb)</p>
                <p className="text-sm font-semibold text-yellow-300">성분: 동사 (Verb)</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                <span className="text-xs text-purple-400 font-bold">Word: tentative</span>
                <p className="text-sm font-semibold mt-1">품사: 형용사 (Adjective)</p>
                <p className="text-sm font-semibold text-yellow-300">성분: 보어 (Complement)</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                <span className="text-xs text-green-400 font-bold">Word: streamline</span>
                <p className="text-sm font-semibold mt-1">품사: 동사 (Verb)</p>
                <p className="text-sm font-semibold text-yellow-300">성분: 동사 (Verb)</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-6 text-center">
            <p className="text-blue-300 text-sm">
              💡 아이패드 스플릿 뷰(Split View)로 왼쪽에 이 웹앱을 띄우고, 오른쪽에 굿노트를 띄워 필기하세요!
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
