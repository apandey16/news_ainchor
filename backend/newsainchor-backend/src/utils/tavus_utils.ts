// This file contains utility functions that are used for Tavus, the DeepFake system used to create the videos.
// To-do: Once hosted on AWS, move this to the lambda package and install needed dependencies.

import * as dotenv from 'dotenv';
import { format } from 'date-fns';
dotenv.config();

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;

function createVideoTitle(date?: string, uniqueIdentifier?: string) {
	// Use the provided date or format current date as DD-MM-YYYY
	const formattedDate = date ? date.replace(/-/g, '_') : format(new Date(), 'dd_MM_yyyy');

	if (uniqueIdentifier) {
		return `${formattedDate}_${uniqueIdentifier}`;
	}
	return formattedDate;
}

type generationReturn = {
	status: string;
	video_id: string;
	hosted_url: string;
	created_at: string;
	video_name: string;
};

export type VideoGenerationResponse = {
	video_id: string;
	video_name: string;
	status: string;
	data: {
		script: string;
	};
	replica_id: string;
	download_url: string;
	hosted_url: string;
	stream_url: string;
	status_details: string;
	created_at: string;
	updated_at: string;
	generation_progress: string;
};

// The script generation function will be in the chatGPT API utils file.
export async function generateNewsVideo(params: {
	deepFakeId: string;
	script: string;
	uniqueTitleIdentifier?: string;
	apiKey: string;
	date?: string;
}): Promise<generationReturn> {
	const title = createVideoTitle(params.date, params.uniqueTitleIdentifier);
	console.log('Creating video with title:', title);

	// options for the generation API request
	const body = {
		background_url: '',
		replica_id: params.deepFakeId,
		script: params.script,
		video_name: title,
	};
	const options = {
		method: 'POST',
		headers: {
			'x-api-key': `${params.apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	};

	const apiResponse = await fetch('https://tavusapi.com/v2/videos', options)
		.then((response) => response.json())
		.catch((err) => {
			console.error(err);
			throw new Error('Failed to generate news video');
		});

	return apiResponse as generationReturn;
}

export async function getNewsVideo(params: { videoId: string; apiKey: string }): Promise<VideoGenerationResponse> {
	const options = {
		method: 'GET',
		headers: { 'x-api-key': `${params.apiKey}` },
	};

	const apiResponse = await fetch(`https://tavusapi.com/v2/videos/${params.videoId}`, options)
		.then((response) => response.json())
		.catch((err) => {
			console.error(err);
			throw new Error('Failed to get news video');
		});

	return apiResponse as VideoGenerationResponse;
}

// this can be used for testing (if we ever create tests)
const demoScript =
	"With the All Spark gone, we cannot return life to our planet. And fate has yielded its reward: a new world to call... home. We live among its people now, hiding in plain sight... but watching over them in secret... waiting... protecting. I have witnessed their capacity for courage, and though we are worlds apart, like us, there's more to them than meets the eye. I am Optimus Prime, and I send this message to any surviving Autobots taking refuge among the stars: We are here... we are waiting.";

// const respo = await generateNewsVideo({
// 	deepFakeId: 'rdb0fe17e450',
// 	script: demoScript,
// });

// Need to figure out how long it might take or have it trigger an SNS notification when the video is ready.
// await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000));
// const getResponse = await getNewsVideo({ videoId: respo.video_id });
// const getResponse = await getNewsVideo({videoId: 'f940195501'});

// Sample console.log(getResponse);
// {
//   video_id: 'f940195501',
//   video_name: '04_02_2025',
//   status: 'ready',
//   data: {
//     script: "With the All Spark gone, we cannot return life to our planet. And fate has yielded its reward: a new world to call... home. We live among its people now, hiding in plain sight... but watching over them in secret... waiting... protecting. I have witnessed their capacity for courage, and though we are worlds apart, like us, there's more to them than meets the eye. I am Optimus Prime, and I send this message to any surviving Autobots taking refuge among the stars: We are here... we are waiting."
//   },
//   replica_id: 'r79e1c033f',
//   download_url: 'https://stream.mux.com/ylqmQuaYdXzI8CIzqfYbH1ZTU2U7GJ6sEUlnW9jcyZ4/high.mp4?download=f940195501',
//   hosted_url: 'https://tavus.video/f940195501',
//   stream_url: 'https://stream.mux.com/ylqmQuaYdXzI8CIzqfYbH1ZTU2U7GJ6sEUlnW9jcyZ4.m3u8',
//   status_details: 'Your request has processed successfully!',
//   created_at: 'Wed, 05 Feb 2025 04:27:02 GMT',
//   updated_at: 'Wed, 05 Feb 2025 04:31:06 GMT',
//   generation_progress: '100/100'
// }
