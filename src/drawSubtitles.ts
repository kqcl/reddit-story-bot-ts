import { exec } from 'child_process';
import { getTranscription } from './makesubtitles';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
const { convert } = require('subsrt');

interface Subtitle {
    word: string;
    start: number;
    end: number;
    confidence: number;
}

export function addSubtitlesToVideo(
    subtitlePath: string,
    videoPath: string,
    subtitles: Subtitle[],
    outputPath: string,
): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const secondsToSRTTime = (seconds: number): string => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const milliseconds = Math.floor(
                (seconds - Math.floor(seconds)) * 1000,
            );
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

        fs.writeFileSync(subtitlePath, srtContent);

        const command = `ffmpeg -i ${videoPath} -vf "subtitles=${subtitlePath}:force_style='FontName=Arial,FontSize=36,Bold=1,PrimaryColour=&Hffffff&,Alignment=10'" -c:a copy -c:v libx264 -crf 23 -preset medium -tune film -pix_fmt yuv420p -t ${lastSubtitleEndTime} ${outputPath}`;

        console.log(command);

        exec(command, (error, stdout, stderr) => {
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

// addSubtitlesToVideo(videoPath, subtitles, outputPath)
//     .then(() => console.log('Video with subtitles created successfully!'))
