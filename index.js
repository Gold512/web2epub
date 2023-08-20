import { EPub } from "@lesjoursfr/html-to-epub";
import { JSDOM } from 'jsdom'
import fetch from "node-fetch";
import fs from 'fs'

import {title, author, publisher, sources, contentSelector, verbose, threads, processHTML} from './config.js'

let dir = 'output'
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

function sleep(t) {
    return new Promise(resolve => setTimeout(resolve, t))
}

let timetaken = 'Pulled data from sites'
if(verbose) console.time(timetaken)

let chapters = [];
let queue = [];

for(let i in sources) {
    queue.push(new Promise(async resolve => {
        let index = chapters.length;

        if(verbose) console.log(`fetching '${i}' at ${sources[i]}`);

        let text = await fetch(sources[i]);
        text = await text.text();
        let dom = (await new JSDOM(text)).window.document;
        let mainContent = contentSelector ? dom.querySelector(contentSelector) : dom.body;
        if(!mainContent) throw new Error('unable to get content from source ' + sources[i]);

        let processed = processHTML ? processHTML(mainContent) : mainContent.innerHTML;

        if(verbose) console.log(`Extracted ${processed.length} characters of HTML`)

        chapters[index] = {title: i, data:processed};

        resolve();
    }));

    // sleep so that we do not spam the sites we are pulling data from
    if(threads > 1) await sleep(300);

    if(queue.length === threads) {
        await Promise.all(queue);
        queue = [];
    }
}

// in case there are still some unfinished processes
await Promise.all(queue);

if(verbose) console.timeEnd(timetaken)

const epub = new EPub({
    title: title,
    author: author,
    publisher: publisher,
    verbose: verbose,
    content: chapters
}, `./output/${title}.epub`)

epub.render()
    .then(() => {
        console.log("Ebook Generated Successfully!");
    })
    .catch((err) => {
        console.error("Failed to generate Ebook because of ", err);
    });
