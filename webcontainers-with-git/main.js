import './style.css'
import { WebContainer } from '../webcontainers-frist-test/node_modules/@webcontainer/api/dist'
import { files } from './files';

/** @type {import('../webcontainers-frist-test/node_modules/@webcontainer/api/dist').WebContainer}  */
let webcontainerInstance

/** @param {string} content */

const execCommand = async (command, options) => {
  const cmd = await webcontainerInstance.spawn(command, options)
  cmd.output.pipeTo(new WritableStream({
    write(data) {
      console.log('>', data)
    }
  }))

  return cmd.exit
}

const execCmd = async (command, options) => {
  const exitCode = await execCommand(command, options)
  if (exitCode !== 0) {
    throw new Error(`${command} failed`)
  };
}

window.addEventListener('load', async () => {
  // textareaEl.value = files['index.js'].file.contents

  // Call only once
  webcontainerInstance = await WebContainer.boot()
  await webcontainerInstance.mount(files);

  await execCmd('npm', ['install'])
  console.log('>> OK')
  await execCmd('npm', ['run', 'start'])
  console.log('>> exec')
  await execCmd('ls', ['', '-la'])
  console.log('>> end')
  const image = await webcontainerInstance.fs.readFile('Design sem nome.png.json', 'utf-8');
  const imageJSON = JSON.parse(image)
  console.log(imageJSON);
  iframeEl.src = `data:image/${imageJSON.typeFile};${imageJSON.encoding},${imageJSON.content}`;
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
