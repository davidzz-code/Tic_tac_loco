import { useState } from 'react'
import { useI18n } from '../i18n/i18n'

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function RoomManager({ onlineStatus, roomId, message, onCreate, onJoin, onBack }) {
  const { t } = useI18n()
  const [inputRoomId, setInputRoomId] = useState('')

  function handleCreate() {
    onCreate(generateRoomCode())
  }

  function handleJoin() {
    const code = inputRoomId.trim().toUpperCase()
    if (code) onJoin(code)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#242424] text-white p-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">{t('online.title')}</h1>

      {onlineStatus === 'connecting' && (
        <p className="text-gray-300 animate-pulse">{t('online.connecting')}</p>
      )}

      {onlineStatus === 'waiting' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-300">{t('online.shareCode')}</p>
          <div className="text-4xl font-bold tracking-[0.3em] px-6 py-4 border-2 border-white rounded-lg bg-[#343434]">
            {roomId}
          </div>
          <p className="text-gray-400 animate-pulse mt-2">{t('online.waiting')}</p>
        </div>
      )}

      {onlineStatus === 'menu' && (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <button
            onClick={handleCreate}
            className="w-full py-4 bg-gray-200 text-[#242424] font-semibold rounded-lg hover:scale-105 transition-transform duration-200"
          >
            {t('online.createRoom')}
          </button>

          <div className="flex items-center w-full gap-3 text-gray-500 text-sm">
            <span className="flex-1 h-px bg-gray-600" /> {t('common.or')} <span className="flex-1 h-px bg-gray-600" />
          </div>

          <div className="flex w-full gap-2">
            <input
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder={t('online.roomCodePlaceholder')}
              maxLength={5}
              className="flex-1 px-4 py-3 rounded-lg bg-[#343434] border-2 border-gray-600 focus:border-white outline-none uppercase tracking-widest text-center"
            />
            <button
              onClick={handleJoin}
              className="px-5 py-3 border-2 border-white rounded-lg hover:bg-gray-800 transition duration-200"
            >
              {t('online.join')}
            </button>
          </div>

          {message && <p className="text-red-400 text-sm">{message}</p>}
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-10 text-sm text-gray-400 hover:text-white transition-colors duration-200"
      >
        {t('common.backToMenu')}
      </button>
    </div>
  )
}
