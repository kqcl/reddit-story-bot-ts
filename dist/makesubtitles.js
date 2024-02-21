"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranscription = exports.transcribeAudio = exports.uploadAudio = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const api_key = (_a = process.env.GLADIA_API_KEY) !== null && _a !== void 0 ? _a : 'DEFAULT_API_KEY';
async function uploadAudio(path) {
    const form = new form_data_1.default();
    form.append('audio', fs_1.default.createReadStream(path));
    const response = await (0, node_fetch_1.default)('https://api.gladia.io/v2/upload', {
        method: 'POST',
        body: form,
        headers: Object.assign(Object.assign({}, form.getHeaders()), { 'x-gladia-key': api_key }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data.audio_url);
    return data.audio_url;
}
exports.uploadAudio = uploadAudio;
async function transcribeAudio(audio_url) {
    const response = await (0, node_fetch_1.default)('https://api.gladia.io/v2/transcription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-gladia-key': api_key,
        },
        body: JSON.stringify({
            audio_url: audio_url !== null && audio_url !== void 0 ? audio_url : 'https://gladia.io/static/audio/short.mp3',
        }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data.id);
    return data.id;
}
exports.transcribeAudio = transcribeAudio;
async function getTranscription(id) {
    const options = { method: 'GET', headers: { 'x-gladia-key': api_key } };
    try {
        const response = await (0, node_fetch_1.default)(`https://api.gladia.io/v2/transcription/${id}`, options);
        const data = await response.json();
        const wordsArr = [];
        data.result.transcription.utterances.forEach((utterance) => {
            wordsArr.push(...utterance.words);
        });
        // console.log(wordsArr);
        return wordsArr;
    }
    catch (err) {
        console.error(err);
    }
}
exports.getTranscription = getTranscription;
