import { useState, useEffect } from 'react'
import { AccountCard } from '../../components/AccountCard'
import { Button } from '../../components/Button'
import { getAccounts, saveAccounts } from '../../utils/storage'
import { initiateHubSpotAuth, getAccountInfo } from '../../utils/hubspot'

export function Options() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    const accounts = await getAccounts()
    setAccounts(accounts)
  }

  const handleAddAccount = async () => {
    try {
      setLoading(true)
      const authResult = await initiateHubSpotAuth()
      console.log('Auth Result:', authResult)  // Debug log
      const accountInfo = await getAccountInfo(authResult.access_token)

      console.log('Account Info:', accountInfo)  // Debug log
      
      const newAccount = {
        hubId: accountInfo.portalId,
        name: accountInfo.accountName,
        accessToken: authResult.access_token,
        refreshToken: authResult.refresh_token  // Make sure this exists
      }

      console.log('New Account to be saved:', newAccount)  // Debug log

      const updatedAccounts = [...accounts, newAccount]
      await saveAccounts(updatedAccounts)
      setAccounts(updatedAccounts)
    } catch (error) {
      console.error('Failed to add account:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAccount = async (accountId) => {
    const updatedAccounts = accounts.filter(account => account.id !== accountId)
    await saveAccounts(updatedAccounts)
    setAccounts(updatedAccounts)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        HubSpot Account Manager
      </h1>
      
      <div className="space-y-4">
        {accounts.map(account => (
          <AccountCard 
            key={account.hubId} 
            account={account} 
            onRemove={handleRemoveAccount}
          />
        ))}
      </div>

      <Button
        onClick={handleAddAccount}
        disabled={loading}
        className="mt-6"
      >
        {loading ? 'Adding Account...' : 'Add HubSpot Account'}
      </Button>
    </div>
  )
}
