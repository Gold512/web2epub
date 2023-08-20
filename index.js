import { EPub } from "@lesjoursfr/html-to-epub";
import { JSDOM } from 'jsdom'
import fetch from "node-fetch";
import fs from 'fs'

import {title, author, publisher, sources, contentSelector, verbose, threads, processHTML, cover, pageBreaks} from './config.js'

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

for(let i = 0, k = Object.keys(sources); i < k.length; i++) {
    queue.push(new Promise(async resolve => {
        const title = k[i];
        const source = sources[k[i]]
        const index = i;

        if(verbose) console.log(`[${index+1}/${k.length}] fetching '${title}' at ${source}`);

        let text = await fetch(source);
        text = await text.text();
        let dom = (await new JSDOM(text)).window.document;
        let mainContent = contentSelector ? dom.querySelector(contentSelector) : dom.body;
        if(!mainContent) throw new Error('unable to get content from source ' + source);

        let processed = processHTML ? processHTML(mainContent) : mainContent.innerHTML;

        if(verbose) console.log(`[${index+1}/${k.length}] Extracted ${processed.length} characters of HTML`)

        if(pageBreaks) processed += '<p style="page-break-before: always"></p>';
        chapters[index] = {title: title, data:processed};

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
    content: chapters,
    cover: cover
}, `./output/${title}.epub`)

epub.render()
    .then(() => {
        console.log("Ebook Generated Successfully!");
    })
    .catch((err) => {
        console.error("Failed to generate Ebook because of ", err);
    });
