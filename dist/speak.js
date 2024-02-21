"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpeech = exports.getIterableStories = void 0;
const { config, createAudioFromText } = require('tiktok-tts');
const dotenv_1 = __importDefault(require("dotenv"));
const getStories_1 = __importDefault(require("./getStories"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
dotenv_1.default.config();
config(process.env.TT_API_SECRET, 'https://api16-normal-c-useast2a.tiktokv.com/media/api/text/speech/invoke');
function splitText(text, title) {
    // text.replace('tl;dr' || 'TL;DR' || 't.l.d.r', "too long; didn't read");
    // text.replace('aita' || 'AITA' || 'a.i.t.a', 'am I the asshole');
    title = title.replace('AITA', 'am I the asshole');
    console.log(title);
    // text.replace('btw' || 'BTW' || 'b.t.w', 'by the way');
    // text.replace('nta' || 'NTA' || 'n.t.a', 'not the asshole');
    // text.replace('yta' || 'YTA' || 'y.t.a', "you're the asshole");
    // text.replace('esh' || 'ESH' || 'e.s.h', 'everyone sucks here');
    // text.replace('nah' || 'NAH' || 'n.a.h', 'no assholes here');
    let chunks = [];
    let currentChunk = '';
    chunks.push(title);
    let sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    for (let sentence of sentences) {
        sentence = sentence.trim();
        if ((currentChunk + sentence).length <= 200) {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
        else {
            chunks.push(currentChunk);
            currentChunk = sentence;
        }
    }
    chunks.push(currentChunk);
    return chunks;
}
const createAudio = async (text, filename) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createAudioFromText(text, filename);
            resolve();
        }
        catch (e) {
            reject(e);
            console.log(e);
        }
    });
};
const concatmp3s = (directory, output) => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`cd ${directory} && ffmpeg -i "concat:$(ls -1v *.mp3 | tr '\n' '|')" -acodec copy ${output}.mp3`, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            console.log(stdout);
            resolve('concatenated mp3s successfully');
        });
    });
};
const deleteFiles = (directory) => {
    return new Promise((resolve, reject) => {
        fs_1.default.readdir(directory, (err, files) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            files.forEach((file) => {
                const fileDir = path_1.default.join(directory, file);
                if (file !== 'output.mp3') {
                    fs_1.default.unlinkSync(fileDir);
                    console.log(`Deleted ${fileDir}`);
                }
            });
            resolve('Deleted files');
        });
    });
};
async function getIterableStories(subreddit, count) {
    let stories = await (0, getStories_1.default)(subreddit);
    stories = stories.slice(1, count + 1);
    return stories;
}
exports.getIterableStories = getIterableStories;
async function createSpeech(story) {
    await fs_1.default.promises.mkdir(`./audios/${story.name}`, { recursive: true });
    const text = splitText(story.selftext, story.title);
    const audioPromises = text.map((t, i) => createAudio(t, `./audios/${story.name}/audio_${i}`));
    await Promise.all(audioPromises);
    console.log(`created subparts for ${story.name}`);
    await concatmp3s(`./audios/${story.name}`, 'output');
    console.log(`concatenated mp3s for ${story.name}`);
    // await deleteFiles(`./audios/${story.name}`);
    // console.log(`deleted files for ${story.name}`);
}
exports.createSpeech = createSpeech;
