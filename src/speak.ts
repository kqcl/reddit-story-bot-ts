const { config, createAudioFromText } = require('tiktok-tts');
import dotenv from 'dotenv';
import getStories from './getStories';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

dotenv.config();

config(
    process.env.TT_API_SECRET,
    'https://api16-normal-c-useast2a.tiktokv.com/media/api/text/speech/invoke',
);

interface Story {
    url: string;
    title: string;
    selftext: string;
    name: string;
}

function splitText(text: string, title: string): string[] {
    // text.replace('tl;dr' || 'TL;DR' || 't.l.d.r', "too long; didn't read");
    // text.replace('aita' || 'AITA' || 'a.i.t.a', 'am I the asshole');
    title = title.replace('AITA', 'am I the asshole');
    console.log(title);
    // text.replace('btw' || 'BTW' || 'b.t.w', 'by the way');
    // text.replace('nta' || 'NTA' || 'n.t.a', 'not the asshole');
    // text.replace('yta' || 'YTA' || 'y.t.a', "you're the asshole");
    // text.replace('esh' || 'ESH' || 'e.s.h', 'everyone sucks here');
    // text.replace('nah' || 'NAH' || 'n.a.h', 'no assholes here');
    let chunks: string[] = [];
    let currentChunk = '';

    chunks.push(title);

    let sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    for (let sentence of sentences) {
        sentence = sentence.trim();
        if ((currentChunk + sentence).length <= 200) {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
        } else {
            chunks.push(currentChunk);
            currentChunk = sentence;
        }
    }

    chunks.push(currentChunk);

    return chunks;
}

const createAudio = async (text: string, filename: string) => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            await createAudioFromText(text, filename);
            resolve();
        } catch (e) {
            reject(e);
            console.log(e);
        }
    });
};

const concatmp3s = (directory: string, output: string) => {
    return new Promise((resolve, reject) => {
        exec(
            `cd ${directory} && ffmpeg -i "concat:$(ls -1v *.mp3 | tr '\n' '|')" -acodec copy ${output}.mp3`,
            (err: any, stdout: any, stderr: any) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                console.log(stdout);
                resolve('concatenated mp3s successfully');
            },
        );
    });
};

const deleteFiles = (directory: string) => {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }

            files.forEach((file) => {
                const fileDir = path.join(directory, file);

                if (file !== 'output.mp3') {
                    fs.unlinkSync(fileDir);
                    console.log(`Deleted ${fileDir}`);
                }
            });

            resolve('Deleted files');
        });
    });
};

export async function getIterableStories(subreddit: string, count: number) {
    let stories = await getStories(subreddit);
    stories = stories.slice(1, count + 1);
    return stories;
}

export async function createSpeech(story: Story) {
    await fs.promises.mkdir(`./audios/${story.name}`, { recursive: true });
    const text = splitText(story.selftext, story.title);
    const audioPromises = text.map((t, i) =>
        createAudio(t, `./audios/${story.name}/audio_${i}`),
    );
    await Promise.all(audioPromises);
    console.log(`created subparts for ${story.name}`);
    await concatmp3s(`./audios/${story.name}`, 'output');
    console.log(`concatenated mp3s for ${story.name}`);
    // await deleteFiles(`./audios/${story.name}`);
    // console.log(`deleted files for ${story.name}`);
}
