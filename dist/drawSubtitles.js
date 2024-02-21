"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSubtitlesToVideo = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const { convert } = require('subsrt');
function addSubtitlesToVideo(subtitlePath, videoPath, subtitles, outputPath) {
    return new Promise(async (resolve, reject) => {
        const secondsToSRTTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);
            return `${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${remainingSeconds
                .toString()
                .padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
        };
        let srtContent = '';
        let lastSubtitleEndTime = 0;
        subtitles.forEach((subtitle, index) => {
            const startTime = secondsToSRTTime(subtitle.start);
            const endTime = secondsToSRTTime(subtitle.end);
            srtContent += `${index + 1}\n`;
            srtContent += `${startTime} --> ${endTime}\n`;
            srtContent += `${subtitle.word}\n\n`;
            lastSubtitleEndTime = subtitle.end;
        });
        fs_1.default.writeFileSync(subtitlePath, srtContent);
        const command = `ffmpeg -i ${videoPath} -vf "subtitles=${subtitlePath}:force_style='FontName=Arial,FontSize=36,Bold=1,PrimaryColour=&Hffffff&,Alignment=10'" -c:a copy -c:v libx264 -crf 23 -preset medium -tune film -pix_fmt yuv420p -t ${lastSubtitleEndTime} ${outputPath}`;
        console.log(command);
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                resolve();
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    });
}
exports.addSubtitlesToVideo = addSubtitlesToVideo;
// addSubtitlesToVideo(videoPath, subtitles, outputPath)
//     .then(() => console.log('Video with subtitles created successfully!'))
