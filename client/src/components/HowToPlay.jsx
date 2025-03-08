export default function HowToPlay({setIsHowToPlayOpen}) {
  function closeHowToPlay() {
    setIsHowToPlayOpen(false)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-[#242424] border-2 border-white p-6 rounded-lg max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">How to Play</h2>
          <button
            onClick={closeHowToPlay}
            className="text-md px-4 py-2 font-bold"
          >
            X
          </button>
        </div>
        <p>Instrucciones del tres en raya...</p>
      </div>
    </div>
  )
}