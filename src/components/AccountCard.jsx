export function AccountCard({ account, onRemove }) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900">{account.name}</h3>
          <p className="text-sm text-gray-500">Portal ID: {account.hubId}</p>
          <p className="text-sm text-gray-500">Expires at: {new Date(account.expiresAt).toLocaleString()}</p>
        </div>
        <button
          onClick={() => onRemove(account.hubId)}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

