# PoC-WebContainer-IndexedDB
WebContainer server from Git repository source stored with IndexedDB

## Problems

1) CORS error with fetch in the GitHub API


## What was done

[Blog Astro](https://github.com/withastro/astro/tree/main/examples/blog)
was zipped and mocked in files.js in ArrayBuffer format.

* ### files.js

Contains a node file to read the astro blog file, create the zip from the mocked file, then unzip the zip file, creating the blog folder in the webcontainer.

There is also a node file to zip the astro blog after it is installed in the webcontainer.

* ### main.js

Installation of the webcontainer, following StackBlitz specifications, with modifications to display execution logs in the webcontainer and file exceptions to unzip and zip the astro blog when necessary, in addition to obtaining and saving the zipped astro blog file in IndexedDb.

* ### database.js 

Functions to create the database IndexedDb get file in the database based on the "id" and save the file in the DB

## Server running

https://jolly-sprinkles-dad81c.netlify.app/

Use your browser console to see the webcontainer running

## Localhost test

* Clone this repository 
* `npm install`
* `npm run dev`

* Access http://localhost:5173/

* Use your browser console to see the webcontainer running


<br/>

## Ref.:

1) ### https://webcontainers.io/tutorial/1-build-your-first-webcontainer-app
2) ### https://nesin.io/blog/zip-unzip-directory-node
