import { useState, useEffect, useRef } from "react";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import axios from 'axios'; 

const speechConfig = speechsdk.SpeechConfig.fromSubscription(
  process.env.NEXT_PUBLIC_SPEECH_KEY || "",
  process.env.NEXT_PUBLIC_SPEECH_REGION || ""
);

const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();

function SpeechToText({
  lang,
  setDisplayText,
}: {
  lang: string;
  setDisplayText: React.Dispatch<React.SetStateAction<string>>;
}) {
  const recognizer = useRef(
    new speechsdk.SpeechRecognizer(speechConfig, audioConfig)
  );
  const [guessText, setGuessText] = useState("");
  const [recognizedText, setRecognized] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Função para enviar os dados da transcrição para a API
  async function sendTranscriptionToAPI(transcription: any) {
    try {
      const response = await axios.post('/transcription', {
        audioBuffer: transcription,
      });

      if (response.data.success) {
        console.log('Transcrição enviada com sucesso!');
      } else {
        console.error('Falha ao enviar a transcrição.');
      }
    } catch (error) {
      console.error('Erro ao enviar a transcrição:', error);
    }
  }

  useEffect(() => {
    setDisplayText((prev) => `${prev} ${recognizedText}`.trim());
  }, [recognizedText, setDisplayText]);

  speechConfig.speechRecognitionLanguage = lang;

  const sttFromMicContinuous = () => {
    recognizer.current.startContinuousRecognitionAsync();
  };

  const endMicSession = () => {
    console.log("end mic session");
    recognizer.current.stopContinuousRecognitionAsync(() =>
      console.log("---->>>> stopped")
    );
    console.log("test end");
  };

  recognizer.current.recognizing = (s, e) => {
    console.log(`RECOGNIZING: Text=${e.result.text}`);
    setGuessText(e.result.text);
  };

  recognizer.current.recognized = (s, e) => {
    if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
      console.log(`RECOGNIZED: Text=${e.result.text}`);
      setRecognized(e.result.text);

      // Chama a função para enviar a transcrição para a API
      sendTranscriptionToAPI(e.result.text);
    } else if (e.result.reason === speechsdk.ResultReason.NoMatch) {
      console.log("NOMATCH: Speech could not be recognized.");
    }
  };

  recognizer.current.canceled = (s, e) => {
    console.log(`CANCELED: Reason=${e.reason}`);

    if (e.reason === speechsdk.CancellationReason.Error) {
      console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
      console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
    }

    recognizer.current.stopContinuousRecognitionAsync();
  };

  return (
    <div>
      {isRecording ? "Recording..." : 'Click "Start recording" to start'}
      <div>
        <div style={{ display: "flex" }}>
          <div>
            <button
              onClick={() => {
                sttFromMicContinuous();
                setIsRecording(true);
              }}
            >
              Start recording
            </button>
            <button
              onClick={() => {
                endMicSession();
                setIsRecording(false);
              }}
            >
              Stop recording
            </button>
          </div>
        </div>
        <div>
          <div>recognizing: {guessText}</div>
          <div>final result: {recognizedText}</div>
        </div>
      </div>
    </div>
  );
}

export default SpeechToText;
