/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files = {
  'index.js': {
    file: {
      contents: `
      import 'dotenv/config'
      import { Octokit } from 'octokit'
      import fs from 'fs'

      const octokit = new Octokit({
        auth: process.env.GH_TOKEN
      })

      const owner = 'wisley7l'
      const repo = 'test-assets'

      const getFilesName = async (path) => {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
        // console.log('>>data:', data)
        if (!data.content) {
          return data.map(dirFile => {
            const { name, type } = dirFile
            return { name, type }
          })
        } else {
          const { name, content, type, sha, encoding } = data
          return { name, type, content, sha, encoding }
        }
      }

      const dir = 'assets/images'
      const files = await getFilesName(dir)
      // console.log('>>Files ', JSON.stringify(files))

      const fileName = dir + '/' + files[0].name
      const fileGit = await getFilesName(fileName)

      // console.log('>>File GIT ', JSON.stringify(fileGit))
      const file = fileGit.content?.replaceAll('\\n', '')

      // console.log('>>File: ', JSON.stringify(file))
      // const newFile = Buffer.from(file, fileGit.encoding)
      const typeFile = fileGit.name.split('.')[1]
      fs.writeFileSync(fileGit.name + '.json', JSON.stringify({typeFile, ...fileGit, content: file }))
      console.log('... EXECUTOU')
      `,
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "git-app",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "description": "",
  "main": "index.js",
  "author": "",
  "license": "ISC",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "dotenv": "^16.3.1",
    "express": "latest",
    "nodemon": "latest",
    "octokit": "^3.1.1"
  },
  "devDependencies": {
    "standard": "^17.1.0"
  }
}`,
    },
  },
  '.env': {
    file: {
      contents: `GH_TOKEN="${import.meta.env.VITE_GH_TOKEN}"`
    }
  }
};
