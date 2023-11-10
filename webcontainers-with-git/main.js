import './style.css'
import { WebContainer } from '../webcontainers-frist-test/node_modules/@webcontainer/api/dist'
import { files } from './files';
import { database, add, get } from './database.js'

// WEBCONTAINER ****
/** @type {import('../webcontainers-frist-test/node_modules/@webcontainer/api/dist').WebContainer}  */
let webcontainerInstance

/** @param {string} content */

if (!('indexedDB' in window)) {
  console.log("This browser doesn't support IndexedDB");
}

const commandExec = async (command, options, debbug) => {
  const cmd = await webcontainerInstance.spawn(command, options)
  cmd.output.pipeTo(new WritableStream({
    write(data) {
      if (debbug) {
        console.log(':', data)
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
const repoName = `${import.meta.env.VITE_GH_OWNER}-${import.meta.env.VITE_GH_REPO}`
const initWebContainer = async () => {
  console.log('>> WebContaner')
  webcontainerInstance = await WebContainer.boot()
  await webcontainerInstance.mount(files)
  await execCmd('npm', ['install'])
  await execCmd('npm', ['run', 'setup'])
}

window.addEventListener('load', async () => {
  const db = await database
  await initWebContainer()
  let img = await get(db, 'images', `./${repoName}/assets/images/logowhite-e-com.png`)

  // await execCmd('ls', ['-la'], true)

  // console.log('>img ', img)
  if (img) {
    iframeEl.src = `data:image/png;base64,${img.data}`
  }

  // Call only once
  if (!img) {
    console.log('>> Get Repo')
    const dirs = await webcontainerInstance.fs.readdir('./')
    const dirName = dirs.find(dir => dir.startsWith(`${repoName}`))

    const dirsAssets = (await webcontainerInstance.fs.readdir(`./${dirName}/assets/`)).map(dir => {
      // disregard files
      if (!dir.includes('.')) {
        return dir
      }
    })

    dirsAssets.forEach(async (dir) => {
      // console.log('>>dir ', dir)
      const files = await webcontainerInstance.fs.readdir(`./${dirName}/assets/${dir}`)
      // console.log('files: ', files)
      files.forEach(async (fileName) => {
        const path = `./${repoName}/assets/${dir}/${fileName}`
        const file = await webcontainerInstance.fs.readFile(`./${dirName}/assets/${dir}/${fileName}`, 'base64')
        // console.log('>> ', file)
        const obj = { path, encoding: 'base64', data: file, format: fileName.split('.')[1] }
        add(db, dir, obj)
      })
    })
  }
})

document.querySelector('#app').innerHTML = `
  <div class="container">
    <!-- div class="editor">
      <textarea>I am a textarea</textarea>
    </div --!>
    <div class="preview">
      <iframe src="loading.html"></iframe>
    </div>
  </div>
`

/** @type {HTMLIFrameElement | null} */
const iframeEl = document.querySelector('iframe')

/** @type {HTMLTextAreaElement | null} */
// const textareaEl = document.querySelector('textarea')
