export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#343434] border-2 border-white rounded-lg p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        {message && <p className="text-gray-300 text-sm mb-6">{message}</p>}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 border-2 border-gray-500 text-gray-300 rounded-md hover:bg-gray-700 transition duration-200"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`px-4 py-2 border-2 rounded-md transition duration-200 ${
              danger
                ? 'border-red-500 text-red-400 hover:bg-red-500/20'
                : 'border-white text-white hover:bg-gray-700'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
