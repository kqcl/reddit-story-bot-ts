"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideo = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
function mergeAudioWithVideo(videoPath, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
        console.log('Merging audio with video...');
        (0, fluent_ffmpeg_1.default)()
            .input(videoPath)
            .input(audioPath)
            .outputOptions([
            '-c:v copy',
            '-c:a copy',
            '-map 0:v:0',
            '-map 1:a:0',
            '-shortest',
        ])
            .output(outputPath)
            .on('error', (err) => {
            console.error('Error occurred:', err);
            reject(err);
        })
            .on('progress', (progress) => {
            console.log(`Processing: ${progress.percent}% done`);
        })
            .on('end', () => {
            console.log('Merging audio with video completed');
            resolve('Merging audio with video completed');
        })
            .run();
    });
}
async function createVideo(video_path, audio_path, output_path) {
    await mergeAudioWithVideo(video_path, audio_path, output_path).catch((error) => console.error('Error in mergeAudioWithVideo:', error));
}
exports.createVideo = createVideo;
