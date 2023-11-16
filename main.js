import './style.css'
import { WebContainer } from './node_modules/@webcontainer/api/dist'
import { files } from './files'
// import { database, add, get } from './database.js'

// WEBCONTAINER ****
/** @type {import('./webcontainers-frist-test/node_modules/@webcontainer/api/dist').WebContainer}  */
let webcontainerInstance

/** @param {string} content */

// const repoName = `${import.meta.env.VITE_GH_OWNER}-${import.meta.env.VITE_GH_REPO}`

if (!('indexedDB' in window)) {
  console.log("This browser doesn't support IndexedDB")
}

const startDevServer = async (src) => {
  const opts = ['run', 'dev']
  if (src) {
    opts.unshift(src)
    opts.unshift('--prefix')
  }
  await webcontainerInstance.spawn('npm', opts)

  // Wait for `server-ready` event
  webcontainerInstance.on('server-ready', (port, url) => {
    // console.log('>> ', url, ' ', port)
    iframeEl.src = url
  })
}

const commandExec = async (command, options, debbug) => {
  const cmd = await webcontainerInstance.spawn(command, options)
  cmd.output.pipeTo(new WritableStream({
    write(data) {
      if (debbug) {
        console.log('>', data)
      }
    }
  }))
  return cmd.exit
}

const execCmd = async (command, options, debbug) => {
  const exitCode = await commandExec(command, options, debbug)
  if (exitCode !== 0) {
    throw new Error(`${command} failed`)
  }
  console.log(`${command} ${options && JSON.stringify(options)} success`)
}

const initWebContainer = async () => {
  console.log('>> WebContaner')
  webcontainerInstance = await WebContainer.boot()
  await webcontainerInstance.mount(files)
  await execCmd('npm', ['install'])
  await execCmd('npm', ['run', 'setup'], true)
}

window.addEventListener('load', async () => {
  // const db = await database
  await initWebContainer()

  // webcontainerInstance.directory
  // await execCmd('ls', ['-la'], true)
  await execCmd('npm', ['--prefix', 'blog', 'i'], true)

  await startDevServer('blog')
  // await execCmd('ls', ['blog', '-la'], true)
})

document.querySelector('#app').innerHTML = `
  <div class="">
    <iframe src="loading.html"></iframe>
  </div>
`

/** @type {HTMLIFrameElement | null} */
const iframeEl = document.querySelector('iframe')

/** @type {HTMLTextAreaElement | null} */
// const textareaEl = document.querySelector('textarea')
