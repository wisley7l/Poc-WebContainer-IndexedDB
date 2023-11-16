import './style.css'
import { WebContainer } from './node_modules/@webcontainer/api/dist'
import { files } from './files'
import { database, add, get } from './database.js'

// WEBCONTAINER ****
/** @type {import('./webcontainers-frist-test/node_modules/@webcontainer/api/dist').WebContainer}  */
let webcontainerInstance

/** @param {string} content */

// const repoName = `${import.meta.env.VITE_GH_OWNER}-${import.meta.env.VITE_GH_REPO}`

if (!('indexedDB' in window)) {
  console.log("This browser doesn't support IndexedDB")
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
  const opts = options && options.reduce((acc, opt) => {
    return acc + ' ' + opt
  }, '')
  console.log(`> ${command} ${opts || ''}`)
  const exitCode = await commandExec(command, options, debbug)
  if (exitCode !== 0) {
    throw new Error(`${command} failed`)
  }
  console.log(`${command} ${opts || ''} success`)
}

const startDevServer = async (src) => {
  const options = ['run', 'dev']
  if (src) {
    options.unshift(src)
    options.unshift('--prefix')
  }
  await webcontainerInstance.spawn('npm', options)

  // Wait for `server-ready` event
  webcontainerInstance.on('server-ready', (port, url) => {
    console.log('> running server: ', url, ':', port)
    iframeEl.src = url
  })
}

const initWebContainer = async () => {
  console.log('>> WebContaner')
  webcontainerInstance = await WebContainer.boot()
  await webcontainerInstance.mount(files)
  await execCmd('npm', ['install'])
}

window.addEventListener('load', async () => {
  const db = await database
  await initWebContainer()

  // await execCmd('ls', ['-la'], true)
  const zip = await get(db, 'repo', 'name')
  if (zip && zip.fileZip) {
    console.log('File exists IndexedDB')
    await webcontainerInstance.fs.writeFile('filezip.zip', zip.fileZip)
  } else {
    console.log('Download Repository')
    await execCmd('npm', ['run', 'git'], true)
    const fileZip = await webcontainerInstance.fs.readFile('filezip.zip')
    console.log(fileZip)
    add(db, 'repo', { name: 'name', fileZip })
  }
  // await execCmd('ls', ['-la'], true)
  await execCmd('npm', ['run', 'unzipper'])
  await execCmd('ls')

  await execCmd('npm', ['--prefix', 'blog', 'i'])
  await startDevServer('blog')
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
