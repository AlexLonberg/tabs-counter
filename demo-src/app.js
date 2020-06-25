/* app.js [ 11.06.2020 : 17:06:09 ] */

import Counter from 'tabs-counter'

const place = {
  open: document.getElementById('tabs-counter-open'),
  close: document.getElementById('tabs-counter-close')
}

const line = document.createElement('div')
line.className = 'line'
const span = document.createElement('span')

const clear = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

const createSpan = (data) => {
  let s = span.cloneNode(true)
  s.textContent = data
  return s
}

const createLine = (url, count) => {
  let l = line.cloneNode(true)
  l.appendChild(createSpan(url))
  l.appendChild(createSpan(`: ${count}`))
  return l
}

const write = (data, target) => {
  clear(target)
  // Счетчик
  let urls = new Map()
  for (let url of Object.values(data)) {
    let count = urls.get(url)
    urls.set(url, (count ? ++count : 1))
  }
  const entries = [...urls.entries()]
  for (let [url, count] of entries) {
    target.appendChild(createLine(url, count))
  }
}

// app

const key = 'tabs-counter'
const listener = ({ open, close }) => {
  console.log({ open, close })
  write(open, place.open)
  write(close, place.close)
}

const counter = Counter({ key, listener })

document.getElementById('bt-on').addEventListener('click', () => {
  counter.on()
})
document.getElementById('bt-off').addEventListener('click', () => {
  counter.off()
})
document.getElementById('bt-get').addEventListener('click', () => {
  console.log(counter.get())
})
document.getElementById('bt-test').addEventListener('click', () => {
  counter.test()
})
