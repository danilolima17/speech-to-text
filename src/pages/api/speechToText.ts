import { SpeechConfig, AudioConfig, SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";

export const transcribeAudio = async (audioBuffer: Buffer) => {
    const subscriptionKey = process.env.NEXT_PUBLIC_SPEECH_KEY || "" ;
    const region = process.env.NEXT_PUBLIC_SPEECH_REGION || "" ;

    const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
    const audioConfig = AudioConfig.fromAudioFileOutput(audioBuffer);
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    return new Promise<string>((resolve, reject) => {
        recognizer.recognizeOnceAsync((result: { text: string | PromiseLike<string>; }) => {
            recognizer.close();
            resolve(result.text);
        }, (error: any) => {
            recognizer.close();
            reject(error);
        });
    });
}
