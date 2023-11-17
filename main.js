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

const startDevServer = async (src, debug) => {
  const options = ['run', 'dev']
  if (src) {
    options.unshift(src)
    options.unshift('--prefix')
  }

  console.log('>> Starting server')
  const cmd = await webcontainerInstance.spawn('npm', options)
  if (debug) {
    cmd.output.pipeTo(new WritableStream({
      write(data) {
        console.log('>', data)
      }
    }))
  }

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

const zipAndSave = async (db) => {
  await execCmd('npm', ['run', 'zipper'], true)
  // await execCmd('ls', ['-la'], true)
  const fileZip = await webcontainerInstance.fs.readFile('./blog.zip')
  // console.log(fileZip)
  add(db, 'repo', { name: 'blog', fileZip })
  // alert('Repo saved')
}

window.addEventListener('load', async () => {
  const db = await database
  await initWebContainer()

  // await execCmd('ls', ['-la'], true)
  const zip = await get(db, 'repo', 'blog')
  if (zip && zip.fileZip) {
    console.log('File exists IndexedDB')
    await webcontainerInstance.fs.writeFile('filezip.zip', zip.fileZip)
    await execCmd('npm', ['run', 'unzipper'], true)
    await execCmd('chmod', ['-R', '777', 'blog'])
    await execCmd('npm', ['--prefix', 'blog', 'rebuild'])
  } else {
    console.log('Download Repository')
    await execCmd('npm', ['run', 'git'], true)
    await execCmd('npm', ['run', 'unzipper'], true)
    // await execCmd('ls', ['-la'], true)
    await execCmd('npm', ['--prefix', 'blog', 'i'])
    zipAndSave(db)
  }

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
