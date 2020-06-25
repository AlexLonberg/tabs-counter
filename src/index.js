/* index.js [ 11.06.2020 : 17:03:38 ] */

const options = {
  key: 'tabs-counter',
  onChanges: true,
  listener: null
}

// Уникальный blob:...
const uniqTabUrl = URL.createObjectURL(new Blob([document.URL], { type: 'text/plain' }))
const tabs = [/*uniqTabUrl*/]
// Текущие открытые вкладки
const map = new Map(/*{blobUrl:document.URL}*/)
const listeners = []

// Возвращает текущие вкладки в формате { blobUrl: document.URL, ... }
const get = () => {
  return Object.fromEntries([...map.entries()])
}

// Только key, onChanges и listener
const setOptions = (opts) => {
  if (!opts) {
    return
  }
  if (typeof opts === 'string') {
    options.key = opts
    return
  }
  const keys = Object.keys(options)
  const has = Object.prototype.hasOwnProperty.bind(opts)
  for (let key of keys) {
    if (!has(key)) {
      continue
    }
    if (key === 'listener' && typeof opts[key] === 'function') {
      listeners.push(opts[key])
    } else {
      options[key] = opts[key]
    }
  }
}

// Чтение или разбор после storage
const readTabs = (value) => {
  tabs.splice(0)
  if (!value) {
    value = window.localStorage.getItem(options.key)
  }
  try {
    value = JSON.parse(value)
  } catch (_) {
    value = []
  }
  if (!Array.isArray(value)) {
    value = []
  }
  tabs.push(...value)
  // Вначале или кто-то удалил
  if (!tabs.includes(uniqTabUrl)) {
    tabs.push(uniqTabUrl)
    writeTabs()
  }
}

// Запись всего массива
const writeTabs = () => {
  window.localStorage.setItem(options.key, JSON.stringify(tabs))
}

// Удаление. 
const deleteTabs = (dt) => {
  for (let u of dt) {
    let x = tabs.indexOf(u)
    if (x !== -1) {
      tabs.splice(x, 1)
    }
  }
  writeTabs()
}

// Тест уникальных uniqTabUrl
const testOpen = async () => {
  const open = []
  const close = []
  for (let tab of tabs) {
    try {
      let res = await fetch(tab)
      let url = await res.text()
      open.push([tab, url])
    } catch (e) {
      close.push(tab)
    }
  }
  return { open, close }
}

const test = async () => {
  const { open, close } = await testOpen()
  if (close.length) {
    deleteTabs(close)
  }

  // Прошлые ключи
  const tabKeys = new Set([...map.keys()])
  for (let [tab, url] of open) {
    if (tabKeys.has(tab)) {
      tabKeys.delete(tab)
    } else {
      map.set(tab, url)
    }
  }

  const data = { close: {} }
  const values = [...tabKeys.values()]
  for (let k of values) {
    data.close[k] = map.get(k)
    map.delete(k)
  }

  if (listeners.length) {
    data.open = get()
    listeners.forEach((cb) => cb(data))
  }
}

// Отслеживаем новые tabs
const onChanges = ({ key, oldValue, newValue }) => {
  if (key === options.key && oldValue !== newValue) {
    readTabs(newValue)
    test()
  }
}

const _on = () => {
  window.addEventListener('storage', onChanges)
  readTabs()
  test()
}

const on = () => {
  if (!options.onChanges) {
    options.onChanges = true
    _on()
  }
}

const off = () => {
  if (options.onChanges) {
    options.onChanges = false
    tabs.splice(0)
    map.clear()
    window.removeEventListener('storage', onChanges)
  }
}

const addListener = (listener) => {
  if (typeof listener === 'function' && !listeners.includes(listener)) {
    listeners.push(listener)
  }
}

const removeListener = (listener) => {
  let i = listeners.indexOf(listener)
  if (i !== -1) {
    listeners.splice(i, 1)
  }
}

const Counter = (opts) => {
  setOptions(opts)

  // При ошибке браузера, проверка uniqTabUrl будет в testOpen()
  window.addEventListener('unload', () => {
    listeners.splice(0)
    deleteTabs([uniqTabUrl])
  })

  if (options.onChanges) {
    _on()
  }

  return {
    on,
    off,
    get,
    test,
    addListener,
    removeListener
  }
}

export {
  Counter,
  on,
  off,
  get,
  test,
  addListener,
  removeListener
}
export default Counter
