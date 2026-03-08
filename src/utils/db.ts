const openDB = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const req = indexedDB.open("mp2026", 1)
  req.onupgradeneeded = () => req.result.createObjectStore("s")
  req.onsuccess = () => resolve(req.result)
  req.onerror = () => reject(req.error)
})

export const dbGet = async (): Promise<string[]> => {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const req = db.transaction("s", "readonly").objectStore("s").get("v")
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })
  } catch (err) {
    console.warn("dbGet failed:", err)
    return []
  }
}

export const dbSet = async (value: string[]): Promise<void> => {
  try {
    const db = await openDB()
    db.transaction("s", "readwrite").objectStore("s").put(value, "v")
  } catch (err) {
    console.warn("dbSet failed:", err)
  }
}

export const dbGetPref = async (): Promise<string[]> => {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const req = db.transaction("s", "readonly").objectStore("s").get("pref")
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })
  } catch { return [] }
}

export const dbSetPref = async (value: string[]): Promise<void> => {
  try {
    const db = await openDB()
    db.transaction("s", "readwrite").objectStore("s").put(value, "pref")
  } catch { /* ignore */ }
}
