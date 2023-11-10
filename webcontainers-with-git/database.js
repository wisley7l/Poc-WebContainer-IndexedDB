// INDEXEDDB
// https://web.dev/articles/indexeddb?hl=pt-br

const database = new Promise((resolve, reject) => {
  let db
  const dbPromise = indexedDB.open('ecomplus', 2)

  dbPromise.onerror = (event) => {
    // reject(new Error('Why didn\'t you allow my web app to use IndexedDB?!'))
  }

  dbPromise.onsuccess = (event) => {
    console.log('>> INDEXEDDB Created')
    db = event.target.result

    resolve(db)
  }

  dbPromise.onupgradeneeded = (event) => {
    db = event.target.result

    const imagesStore = db.createObjectStore('images', { keyPath: 'path' })
    const jsStore = db.createObjectStore('js', { keyPath: 'path' })
    const cssStore = db.createObjectStore('css', { keyPath: 'path' })
    console.log('>> INDEXEDDB Updated')
    resolve(db)
  }
})

const add = (db, colletionName, item) => {
  const tx = db.transaction(colletionName, 'readwrite')
  const colletion = tx.objectStore(colletionName)
  colletion.add(item)
  console.log('> Item saved')
  return tx.complete
}

const get = (db, colletionName, id) => {
  const transaction = db.transaction([colletionName])
  const objectStore = transaction.objectStore(colletionName)
  const request = objectStore.get(id)
  return new Promise((resolve, reject) => {
    request.onerror = (event) => {
      reject(error)
    }
    request.onsuccess = (event) => {
      resolve(request.result)
    }
  })
}

export {
  database,
  add,
  get
}
