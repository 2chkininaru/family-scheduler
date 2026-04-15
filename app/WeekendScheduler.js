import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Check, AlertCircle } from 'lucide-react';

export default function WeekendScheduler() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 15)); // 2026年4月15日
  const [schedules, setSchedules] = useState({});
  const [shoppingItems, setShoppingItems] = useState([]);
  const [boardMessage, setBoardMessage] = useState('');
  const [boardEditingMessage, setBoardEditingMessage] = useState('');
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [newShoppingItem, setNewShoppingItem] = useState('');
  const [formData, setFormData] = useState({
    hasSoccer: true,
    soccerPlace: '',
    soccerPlaceUndecided: false,
    soccerTime: '07:00',
    soccerTimeUndecided: false,
    soccerAttendance: true,
    soccerNote: '',
    hasWork: false,
    fatherDaughterOuting: false,
    motherDaughterOuting: false,
    daughterPlace: '',
    daughterTime: '08:00',
    daughterTimeUndecided: false,
    dinnerType: 'home',
    dinnerContent: '',
    memo: '',
  });

  // ストレージから初期化
  useEffect(() => {
    const initSchedules = async () => {
      try {
        const result = await window.storage.list('weekends:', true);
        if (result && result.keys) {
          const loaded = {};
          for (const key of result.keys) {
            try {
              const data = await window.storage.get(key, true);
              if (data && data.value) {
                loaded[key] = JSON.parse(data.value);
              }
            } catch (e) {
              console.error(`Failed to load ${key}:`, e);
            }
          }
          setSchedules(loaded);
        }
        // 買い物リストを読み込む
        try {
          const shoppingData = await window.storage.get('shopping-list', true);
          if (shoppingData && shoppingData.value) {
            setShoppingItems(JSON.parse(shoppingData.value));
          }
        } catch (e) {
          console.error('Failed to load shopping list:', e);
        }
        // 連絡ボードを読み込む
        try {
          const boardData = await window.storage.get('board-message', true);
          if (boardData && boardData.value) {
            setBoardMessage(boardData.value);
          }
        } catch (e) {
          console.error('Failed to load board message:', e);
        }
      } catch (e) {
        console.error('Failed to load schedules:', e);
      } finally {
        setLoading(false);
      }
    };
    initSchedules();
  }, []);

  // 祝日定義
  const getHolidays = (year) => {
    const holidays = {
      // 2026年の祝日
      '2026-01-01': '元日',
      '2026-01-12': '成人の日',
      '2026-02-11': '建国記念の日',
      '2026-03-20': '春分の日',
      '2026-04-29': '昭和の日',
      '2026-05-03': '憲法記念日',
      '2026-05-04': 'みどりの日',
      '2026-05-05': 'こどもの日',
      '2026-05-06': '振替休日',
      '2026-07-20': '海の日',
      '2026-08-10': '山の日',
      '2026-09-21': '敬老の日',
      '2026-09-22': '秋分の日',
      '2026-10-12': 'スポーツの日',
      '2026-11-03': '文化の日',
      '2026-11-23': '勤労感謝の日',
      // GW期間の特別対応（4月）
      '2026-04-25': 'GW',
      '2026-04-26': 'GW',
      '2026-04-27': 'GW',
      '2026-04-28': 'GW',
    };
    return holidays;
  };

  // 今月の土日祝日とGWを取得
  const getWeekendDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const holidays = getHolidays(year);

    const weekends = [];
    for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
      const checkDate = new Date(year, month, d);
      const dayOfWeek = checkDate.getDay();
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      // 土日か祝日またはGWなら追加
      if (dayOfWeek === 0 || dayOfWeek === 6 || holidays[dateKey]) {
        weekends.push({ date: checkDate, holiday: holidays[dateKey] });
      }
    }
    return weekends;
  };

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `weekends:${y}-${m}-${d}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const formatDateDisplay = (date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const d = date.getDate();
    const day = days[date.getDay()];
    return `${d}日（${day}）`;
  };

  const handleOpenModal = (date) => {
    const key = formatDateKey(date);
    const existingData = schedules[key];
    if (existingData) {
      setFormData(existingData);
    } else {
      setFormData({
        hasSoccer: true,
        soccerPlace: '',
        soccerPlaceUndecided: false,
        soccerTime: '07:00',
        soccerTimeUndecided: false,
        soccerAttendance: true,
        soccerNote: '',
        hasWork: false,
        fatherDaughterOuting: false,
        motherDaughterOuting: false,
        daughterPlace: '',
        daughterTime: '08:00',
        daughterTimeUndecided: false,
        dinnerType: 'home',
        dinnerContent: '',
        memo: '',
      });
    }
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const key = formatDateKey(selectedDate);
      await window.storage.set(key, JSON.stringify(formData), true);
      setSchedules((prev) => ({ ...prev, [key]: formData }));
      showToast('予定を保存しました ✓');
      setIsModalOpen(false);
    } catch (e) {
      console.error('Save failed:', e);
      showToast('保存に失敗しました', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const key = formatDateKey(selectedDate);
      await window.storage.delete(key, true);
      const newSchedules = { ...schedules };
      delete newSchedules[key];
      setSchedules(newSchedules);
      showToast('予定を削除しました');
      setIsModalOpen(false);
    } catch (e) {
      console.error('Delete failed:', e);
      showToast('削除に失敗しました', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  const addShoppingItem = async () => {
    if (!newShoppingItem.trim()) {
      showToast('買い物を入力してください', 'error');
      return;
    }
    try {
      const newItem = {
        id: Date.now(),
        text: newShoppingItem,
        date: new Date().toLocaleString('ja-JP'),
        completed: false,
      };
      const updated = [...shoppingItems, newItem];
      await window.storage.set('shopping-list', JSON.stringify(updated), true);
      setShoppingItems(updated);
      setNewShoppingItem('');
      showToast('買い物を追加しました ✓');
    } catch (e) {
      console.error('Failed to add shopping item:', e);
      showToast('追加に失敗しました', 'error');
    }
  };

  const toggleShoppingItem = async (id) => {
    try {
      const updated = shoppingItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      await window.storage.set('shopping-list', JSON.stringify(updated), true);
      setShoppingItems(updated);
    } catch (e) {
      console.error('Failed to update shopping item:', e);
      showToast('更新に失敗しました', 'error');
    }
  };

  const deleteShoppingItem = async (id) => {
    try {
      const updated = shoppingItems.filter((item) => item.id !== id);
      await window.storage.set('shopping-list', JSON.stringify(updated), true);
      setShoppingItems(updated);
      showToast('削除しました');
    } catch (e) {
      console.error('Failed to delete shopping item:', e);
      showToast('削除に失敗しました', 'error');
    }
  };

  const saveBoardMessage = async () => {
    try {
      await window.storage.set('board-message', boardEditingMessage, true);
      setBoardMessage(boardEditingMessage);
      setIsBoardModalOpen(false);
      showToast('連絡ボードを保存しました ✓');
    } catch (e) {
      console.error('Failed to save board message:', e);
      showToast('保存に失敗しました', 'error');
    }
  };

  const openBoardModal = () => {
    setBoardEditingMessage(boardMessage);
    setIsBoardModalOpen(true);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const weekends = getWeekendDates(currentDate);
  const monthString = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  const renderSummaryCard = (date) => {
    const key = formatDateKey(date);
    const data = schedules[key];
    if (!data) return null;

    return (
      <div className="space-y-1 text-sm">
        {data.hasSoccer && (
          <div className="flex items-center gap-2 text-amber-700">
            <span className="text-lg">⚽</span>
            <span className="truncate">
              {data.soccerPlaceUndecided ? '未定' : data.soccerPlace}
              {data.soccerTimeUndecided ? '' : ` ${data.soccerTime}`}
            </span>
          </div>
        )}
        {data.hasWork && (
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-lg">💼</span>
            <span>仕事あり</span>
          </div>
        )}
        {(data.fatherDaughterOuting || data.motherDaughterOuting) && (
          <div className="flex items-center gap-2 text-pink-700">
            <span className="text-lg">🎀</span>
            <span className="truncate">
              {data.fatherDaughterOuting && '👨'}{data.motherDaughterOuting && '👩'}
              {data.daughterPlace ? ` ${data.daughterPlace}` : ''}
              {data.daughterTimeUndecided ? '' : ` ${data.daughterTime}`}
            </span>
          </div>
        )}
        {data.dinnerType === 'home' ? (
          <div className="flex items-center gap-2 text-green-700">
            <span className="text-lg">🍽️</span>
            <span>家で作る</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-lg">🍽️</span>
            <span className="truncate">{data.dinnerContent}</span>
          </div>
        )}
      </div>
    );
  };

  const getHistoryData = () => {
    const allDates = Object.entries(schedules).map(([key, data]) => ({
      date: new Date(key.replace('weekends:', '').replace(/-/g, '/')),
      data,
      key,
    }));
    return allDates.sort((a, b) => b.date - a.date).slice(0, 30);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500"></div>
          <p className="mt-4 text-amber-900">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 font-sans" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
      <div className="sticky top-0 z-30 bg-white shadow-md">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-center text-3xl font-bold text-amber-900">
            🏡 ファミリー週末スケジュール
          </h1>
          <p className="mt-1 text-center text-sm text-amber-700">土日の予定を家族で共有しましょう</p>
        </div>
      </div>

      {/* タブ */}
      <div className="sticky top-[100px] z-20 border-b-2 border-amber-200 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-4 font-semibold transition ${
                activeTab === 'schedule'
                  ? 'border-b-4 border-amber-500 text-amber-900'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              📅 予定
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 font-semibold transition ${
                activeTab === 'history'
                  ? 'border-b-4 border-amber-500 text-amber-900'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              📋 履歴
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`flex-1 py-4 font-semibold transition ${
                activeTab === 'shopping'
                  ? 'border-b-4 border-amber-500 text-amber-900'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              🛒 買い物
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 予定タブ */}
        {activeTab === 'schedule' && (
          <div>
            {/* 黒板風連絡ボード */}
            <div 
              className="mb-8 rounded-2xl bg-gray-800 p-6 shadow-2xl cursor-pointer transition hover:shadow-3xl relative"
              style={{ height: 'auto', minHeight: '240px', maxHeight: '240px', overflow: 'hidden' }}
              onDoubleClick={() => {
                const boardContent = document.getElementById('board-content');
                if (boardContent) {
                  boardContent.style.maxHeight = boardContent.style.maxHeight === 'none' ? '240px' : 'none';
                  boardContent.style.overflow = boardContent.style.overflow === 'auto' ? 'hidden' : 'auto';
                }
              }}
              title="ダブルクリックで詳細表示"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
                  <span>📢</span> ファミリー連絡ボード
                </h3>
                <button
                  onClick={openBoardModal}
                  className="rounded-lg bg-yellow-400 text-gray-800 px-4 py-2 font-bold hover:bg-yellow-300 transition text-sm"
                >
                  編集
                </button>
              </div>
              <div 
                id="board-content"
                className="text-white text-base whitespace-pre-wrap break-words font-mono max-h-48 overflow-hidden"
                style={{ fontFamily: 'Courier New, monospace', lineHeight: '1.8' }}
              >
                {boardMessage || '連絡事項をここに書きます。編集ボタンから追加してください。'}
              </div>
              {boardMessage && boardMessage.split('\n').length > 3 && (
                <div className="absolute bottom-2 right-4 text-yellow-300 text-xs font-bold">
                  💡 ダブルクリックで続きを表示
                </div>
              )}
            </div>
            {/* 月切り替え */}
            <div className="mb-8 flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-lg">
              <button
                onClick={previousMonth}
                className="rounded-full p-3 hover:bg-amber-100 transition"
              >
                <ChevronLeft className="h-6 w-6 text-amber-700" />
              </button>
              <h2 className="text-2xl font-bold text-amber-900">{monthString}</h2>
              <button
                onClick={nextMonth}
                className="rounded-full p-3 hover:bg-amber-100 transition"
              >
                <ChevronRight className="h-6 w-6 text-amber-700" />
              </button>
            </div>

            {/* 土日祝日・GWカード */}
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              {weekends.map(({ date, holiday }) => {
                const key = formatDateKey(date);
                const hasData = !!schedules[key];
                const dayOfWeek = date.getDay();
                const isSaturday = dayOfWeek === 6;
                const isSunday = dayOfWeek === 0;
                
                let cardColor = 'border-l-4 border-gray-400 bg-gray-50 hover:bg-gray-100';
                if (isSaturday) {
                  cardColor = 'border-l-4 border-blue-400 bg-blue-50 hover:bg-blue-100';
                } else if (isSunday) {
                  cardColor = 'border-l-4 border-red-400 bg-red-50 hover:bg-red-100';
                }

                return (
                  <div
                    key={key}
                    onClick={() => handleOpenModal(date)}
                    className={`cursor-pointer rounded-2xl p-6 shadow-md transition hover:shadow-lg ${cardColor}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">
                        {formatDateDisplay(date)}
                      </h3>
                      {holiday && (
                        <span className="text-xs font-bold px-2 py-1 bg-amber-400 text-amber-900 rounded-full">
                          {holiday}
                        </span>
                      )}
                    </div>
                    {hasData ? (
                      renderSummaryCard(date)
                    ) : (
                      <div className="flex items-center gap-2 text-amber-700">
                        <Plus className="h-5 w-5" />
                        <span className="text-sm font-medium">予定を追加</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 日付追加ボタン */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-lg border-2 border-blue-200">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-blue-900">
                <span>📆</span> イレギュラーな日を追加
              </h3>
              <p className="mb-4 text-sm text-blue-800">平日休み、代休などを追加できます</p>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1).map((day) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const dayOfWeek = date.getDay();
                  const key = formatDateKey(date);
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  const isHoliday = getHolidays(currentDate.getFullYear())[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`];
                  const isAdded = schedules[key];

                  return (
                    <button
                      key={day}
                      onClick={() => handleOpenModal(date)}
                      disabled={isWeekend || isHoliday}
                      className={`rounded-lg px-3 py-2 font-semibold transition ${
                        isAdded
                          ? 'bg-green-500 text-white'
                          : isWeekend || isHoliday
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-blue-700 border-2 border-blue-300 hover:bg-blue-100'
                      }`}
                      title={isWeekend ? '土日は除外' : isHoliday ? '祝日は除外' : ''}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 履歴タブ */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {getHistoryData().length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-md">
                <p className="text-gray-500">予定がまだ登録されていません</p>
              </div>
            ) : (
              getHistoryData().map(({ date, data, key }) => (
                <div
                  key={key}
                  onClick={() => {
                    setSelectedDate(date);
                    setFormData(data);
                    setIsModalOpen(true);
                  }}
                  className="cursor-pointer rounded-xl bg-white p-4 shadow-md transition hover:shadow-lg"
                >
                  <h4 className="mb-2 font-bold text-gray-800">
                    {date.toLocaleDateString('ja-JP')}（{['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}）
                  </h4>
                  <div className="text-sm text-gray-600">
                    {data.hasSoccer && `⚽ ${data.soccerPlace || '未定'} `}
                    {data.hasWork && `💼 仕事 `}
                    {(data.fatherDaughterOuting || data.motherDaughterOuting) && `🎀 ${data.fatherDaughterOuting && '👨'}${data.motherDaughterOuting && '👩'} ${data.daughterPlace} `}
                    {data.dinnerType === 'home' ? '🍽️ 家で作る' : `🍽️ ${data.dinnerContent}`}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 買い物タブ */}
        {activeTab === 'shopping' && (
          <div>
            {/* 買い物入力欄 */}
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-amber-900">🛒 買い物リスト</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newShoppingItem}
                  onChange={(e) => setNewShoppingItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') addShoppingItem();
                  }}
                  className="flex-1 rounded-lg border-2 border-amber-200 px-4 py-3 focus:outline-none focus:border-amber-500"
                  placeholder="買うものを入力してください"
                />
                <button
                  onClick={addShoppingItem}
                  className="rounded-lg bg-amber-500 px-6 py-3 font-bold text-white transition hover:bg-amber-600 flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  追加
                </button>
              </div>
            </div>

            {/* 買い物リスト */}
            <div className="space-y-2">
              {shoppingItems.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-md">
                  <p className="text-gray-500">買い物がありません</p>
                </div>
              ) : (
                shoppingItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl p-4 shadow-md transition ${
                      item.completed
                        ? 'bg-gray-100'
                        : 'bg-white hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleShoppingItem(item.id)}
                        className={`mt-1 flex-shrink-0 rounded-lg p-2 transition ${
                          item.completed
                            ? 'bg-green-500 text-white'
                            : 'border-2 border-amber-300 text-amber-500 hover:bg-amber-100'
                        }`}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <div className="flex-1">
                        <p
                          className={`text-lg font-semibold ${
                            item.completed
                              ? 'text-gray-400 line-through'
                              : 'text-gray-800'
                          }`}
                        >
                          {item.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.date}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteShoppingItem(item.id)}
                        className="flex-shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-100 transition"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {formatDateDisplay(selectedDate)}の予定
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* サッカー */}
              <div className="rounded-xl bg-amber-50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-amber-900">
                  <span>⚽</span> サッカー
                </h3>
                <div className="flex gap-3 mb-4">
                  {['あり', 'なし'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        setFormData({ ...formData, hasSoccer: opt === 'あり' })
                      }
                      className={`flex-1 rounded-lg py-2 font-bold transition ${
                        formData.hasSoccer === (opt === 'あり')
                          ? 'bg-amber-500 text-white'
                          : 'bg-white text-amber-700 border-2 border-amber-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {formData.hasSoccer && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        場所
                      </label>
                      <input
                        type="text"
                        value={formData.soccerPlace}
                        onChange={(e) =>
                          setFormData({ ...formData, soccerPlace: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-amber-200 px-4 py-2 focus:outline-none focus:border-amber-500"
                        placeholder="グラウンド名など"
                      />
                      <label className="mt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.soccerPlaceUndecided}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              soccerPlaceUndecided: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm text-amber-700">未定</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        開始時間
                      </label>
                      <select
                        value={formData.soccerTime}
                        onChange={(e) =>
                          setFormData({ ...formData, soccerTime: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-amber-200 px-4 py-2 focus:outline-none focus:border-amber-500"
                      >
                        {Array.from({ length: 57 }, (_, i) => {
                          const hours = Math.floor(i / 4) + 6;
                          const minutes = (i % 4) * 15;
                          const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                          return (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          );
                        })}
                      </select>
                      <label className="mt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.soccerTimeUndecided}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              soccerTimeUndecided: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm text-amber-700">未定</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-3">
                        見に行くか
                      </label>
                      <div className="flex gap-3">
                        {['見に行く', '見に行かない'].map((opt) => (
                          <button
                            key={opt}
                            onClick={() =>
                              setFormData({ ...formData, soccerAttendance: opt === '見に行く' })
                            }
                            className={`flex-1 rounded-lg py-2 font-bold transition ${
                              formData.soccerAttendance === (opt === '見に行く')
                                ? 'bg-amber-500 text-white'
                                : 'bg-white text-amber-700 border-2 border-amber-300'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        📝 備考（対戦相手など）
                      </label>
                      <input
                        type="text"
                        value={formData.soccerNote}
                        onChange={(e) =>
                          setFormData({ ...formData, soccerNote: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-amber-200 px-4 py-2 focus:outline-none focus:border-amber-500"
                        placeholder="例: A小学校との試合、リーグ戦など"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 仕事 */}
              <div className="rounded-xl bg-blue-50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-blue-900">
                  <span>💼</span> 仕事するか
                </h3>
                <div className="flex gap-3">
                  {['する', 'しない'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        setFormData({ ...formData, hasWork: opt === 'する' })
                      }
                      className={`flex-1 rounded-lg py-2 font-bold transition ${
                        formData.hasWork === (opt === 'する')
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-blue-700 border-2 border-blue-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 娘との外出 */}
              <div className="rounded-xl bg-pink-50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-pink-900">
                  <span>🎀</span> 娘との外出
                </h3>
                
                {/* 父 */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-pink-900 mb-3">
                    👨 父
                  </label>
                  <div className="flex gap-3 mb-4">
                    {['する', 'しない'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setFormData({ ...formData, fatherDaughterOuting: opt === 'する' })
                        }
                        className={`flex-1 rounded-lg py-2 font-bold transition ${
                          formData.fatherDaughterOuting === (opt === 'する')
                            ? 'bg-pink-500 text-white'
                            : 'bg-white text-pink-700 border-2 border-pink-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 母 */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-pink-900 mb-3">
                    👩 母
                  </label>
                  <div className="flex gap-3 mb-4">
                    {['する', 'しない'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setFormData({ ...formData, motherDaughterOuting: opt === 'する' })
                        }
                        className={`flex-1 rounded-lg py-2 font-bold transition ${
                          formData.motherDaughterOuting === (opt === 'する')
                            ? 'bg-pink-500 text-white'
                            : 'bg-white text-pink-700 border-2 border-pink-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 場所と時間 */}
                {(formData.fatherDaughterOuting || formData.motherDaughterOuting) && (
                  <div className="space-y-3 border-t-2 border-pink-200 pt-4">
                    <div>
                      <label className="block text-sm font-semibold text-pink-900 mb-2">
                        📍 場所
                      </label>
                      <input
                        type="text"
                        value={formData.daughterPlace}
                        onChange={(e) =>
                          setFormData({ ...formData, daughterPlace: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-pink-200 px-4 py-2 focus:outline-none focus:border-pink-500"
                        placeholder="公園、ショッピングモール、図書館など"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-pink-900 mb-2">
                        🕐 出発時間
                      </label>
                      <select
                        value={formData.daughterTime}
                        onChange={(e) =>
                          setFormData({ ...formData, daughterTime: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-pink-200 px-4 py-2 focus:outline-none focus:border-pink-500"
                      >
                        {Array.from({ length: 57 }, (_, i) => {
                          const hours = Math.floor(i / 4) + 6;
                          const minutes = (i % 4) * 15;
                          const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                          return (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          );
                        })}
                      </select>
                      <label className="mt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.daughterTimeUndecided}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              daughterTimeUndecided: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm text-pink-700">未定</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 夜ご飯 */}
              <div className="rounded-xl bg-green-50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-green-900">
                  <span>🍽️</span> 夜ご飯
                </h3>
                <div className="flex gap-3 mb-4">
                  {['家で作る', '買って帰る'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        setFormData({ ...formData, dinnerType: opt === '家で作る' ? 'home' : 'buy' })
                      }
                      className={`flex-1 rounded-lg py-2 font-bold transition ${
                        formData.dinnerType === (opt === '家で作る' ? 'home' : 'buy')
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-green-700 border-2 border-green-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {formData.dinnerType === 'buy' && (
                  <input
                    type="text"
                    value={formData.dinnerContent}
                    onChange={(e) =>
                      setFormData({ ...formData, dinnerContent: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-green-200 px-4 py-2 focus:outline-none focus:border-green-500"
                    placeholder="例: ファミレス、ラーメン、弁当など"
                  />
                )}
              </div>

              {/* メモ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 メモ
                </label>
                <textarea
                  value={formData.memo}
                  onChange={(e) =>
                    setFormData({ ...formData, memo: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:outline-none focus:border-amber-500"
                  rows="3"
                  placeholder="その他の連絡事項など"
                />
              </div>
            </div>

            {/* ボタン */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg bg-amber-500 py-3 font-bold text-white transition hover:bg-amber-600 flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                保存
              </button>
              {schedules[formatDateKey(selectedDate)] && (
                <button
                  onClick={handleDelete}
                  className="flex-1 rounded-lg bg-red-500 py-3 font-bold text-white transition hover:bg-red-600"
                >
                  削除
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-lg bg-gray-200 py-3 font-bold text-gray-700 transition hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* トースト */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 rounded-lg px-6 py-3 text-white font-bold shadow-lg transition ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* 連絡ボード編集モーダル */}
      {isBoardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                📢 連絡ボード編集
              </h2>
              <button
                onClick={() => setIsBoardModalOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                連絡事項（改行可、自由に記入できます）
              </label>
              <textarea
                value={boardEditingMessage}
                onChange={(e) => setBoardEditingMessage(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 h-64 focus:outline-none focus:border-amber-500 font-mono"
                placeholder="例：
・〇〇日は学校の準備物を忘れずに
・買い物：牛乳、卵、パン
・来週のスケジュール確認しました
・GW期間は帰省予定あり"
              />
              <p className="mt-2 text-xs text-gray-500">💡 改行や箇条書きで見やすく記入できます</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveBoardMessage}
                className="flex-1 rounded-lg bg-amber-500 py-3 font-bold text-white transition hover:bg-amber-600 flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                保存
              </button>
              <button
                onClick={() => setIsBoardModalOpen(false)}
                className="flex-1 rounded-lg bg-gray-200 py-3 font-bold text-gray-700 transition hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
