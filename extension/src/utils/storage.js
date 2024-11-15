export const getAccounts = async () => {
  const result = await chrome.storage.sync.get('hubspotAccounts')
  return result.hubspotAccounts || []
}

export const saveAccounts = async (accounts) => {
  await chrome.storage.sync.set({ hubspotAccounts: accounts })
}

export const removeAccount = async (hubId) => {
  const accounts = await getAccounts()
  const updatedAccounts = accounts.filter(account => account.hubId !== hubId)
  await saveAccounts(updatedAccounts)
  return updatedAccounts
}