import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const api_key = process.env.GLADIA_API_KEY ?? 'DEFAULT_API_KEY';

export async function uploadAudio(path: string): Promise<string> {
    const form = new FormData();
    form.append('audio', fs.createReadStream(path));

    const response = await fetch('https://api.gladia.io/v2/upload', {
        method: 'POST',
        body: form,
        headers: {
            ...form.getHeaders(),
            'x-gladia-key': api_key,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.audio_url);
    return data.audio_url;
}

export async function transcribeAudio(audio_url: string) {
    const response = await fetch('https://api.gladia.io/v2/transcription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-gladia-key': api_key,
        },
        body: JSON.stringify({
            audio_url: audio_url ?? 'https://gladia.io/static/audio/short.mp3',
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.id);
    return data.id;
}

interface APIResponse {
    result: {
        transcription: {
            utterances: [
                {
                    words: [
                        {
                            word: string;
                            start: number;
                            end: number;
                        }[],
                    ];
                },
            ];
        };
    };
}

export async function getTranscription(id: string) {
    const options = { method: 'GET', headers: { 'x-gladia-key': api_key } };

    try {
        const response = await fetch(
            `https://api.gladia.io/v2/transcription/${id}`,
            options,
        );
        const data: APIResponse = await response.json();
        const wordsArr: object[] = [];
        data.result.transcription.utterances.forEach((utterance) => {
            wordsArr.push(...utterance.words);
        });
        // console.log(wordsArr);
        return wordsArr;
    } catch (err) {
        console.error(err);
    }
}
