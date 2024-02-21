import { createSpeech, getIterableStories } from './speak';
import {
    getTranscription,
    uploadAudio,
    transcribeAudio,
} from './makesubtitles';
import { addSubtitlesToVideo } from './drawSubtitles';
import { createVideo } from './mergeAudioandVideo';
import fs from 'fs/promises';

interface Story {
    url: string;
    title: string;
    selftext: string;
    name: string;
}

interface Subtitle {
    word: string;
    start: number;
    end: number;
    confidence: number;
}

async function main(subreddit: string, count: number, videoPath: string) {
    const stories: Story[] = await getIterableStories(subreddit, count);
    for (const story of stories) {
        await createSpeech(story);
    }
    const audio_urls = stories.map(
        (story) => `./audios/${story.name}/output.mp3`,
    );
    for (const [i, story] of stories.entries()) {
        const audio_url = await uploadAudio(audio_urls[i]);
        const transcription_id = await transcribeAudio(audio_url);
        const transcription = await getTranscription(transcription_id);
        await addSubtitlesToVideo(
            `./output/${story.name}_subs.srt`,
            videoPath,
            transcription as unknown as Subtitle[],
            `./output/${story.name}_unfinished.mp4`,
        );
        await createVideo(
            `./output/${story.name}_unfinished.mp4`,
            audio_urls[i],
            `./output/${story.name}_finished.mp4`,
        );
    }
}

main('AmITheAsshole', 1, './assets/mc-video.mp4').catch((error) =>
    console.error('Error in main:', error),
);
