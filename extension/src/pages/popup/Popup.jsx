import { useState, useEffect } from 'react'
import { getAccounts } from '../../utils/storage'

export function Popup() {
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    const loadAccounts = async () => {
      const accounts = await getAccounts()
      setAccounts(accounts)
    }
    loadAccounts()
  }, [])

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-900 mb-4">
        HubSpot Accounts
      </h1>
      
      <div className="mb-4">
        <p className="text-gray-600">
          Connected accounts: {accounts.length}
        </p>
      </div>

      <button
        onClick={openOptions}
        className="w-full px-4 py-2 bg-[color:var(--color-hubspot)] hover:bg-[color:var(--color-hubspot-hover)] text-white rounded-md"
      >
        Manage Accounts
      </button>
    </div>
  )
}

