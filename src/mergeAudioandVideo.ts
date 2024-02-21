import ffmpeg from 'fluent-ffmpeg';

function mergeAudioWithVideo(
    videoPath: string,
    audioPath: string,
    outputPath: string,
) {
    return new Promise((resolve, reject) => {
        console.log('Merging audio with video...');
        ffmpeg()
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

export async function createVideo(
    video_path: string,
    audio_path: string,
    output_path: string,
) {
    await mergeAudioWithVideo(video_path, audio_path, output_path).catch(
        (error) => console.error('Error in mergeAudioWithVideo:', error),
    );
}
