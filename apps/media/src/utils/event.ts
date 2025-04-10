
export enum AudioStreamEventType {
    STREAM_START,
    STREAM_STOP,
}

export enum HumanInputEvent {
    START_OF_SPEECH,
    END_OF_SPEECH,
    INTERIM_TRANSCRIPT,
    FINAL_TRANSCRIPTION,
}


export enum VADEventType {
    START_OF_SPEECH,
    INFERENCE_DONE,
    END_OF_SPEECH,
}

export enum SpeechEventType {
    CONNECTED,
    SPEECH_STARTED,
    END_OF_SPEECH,
    FINAL_TRANSCRIPT,
    INTERIM_TRANSCRIPT,
}

export enum LLMEventType {
    RECIEVED_TRANSCRIPT,
    START_GENERATING_RESPONSE,
    INTERM_RESPONSE,
    FINAL_RESPONSE,
}

export enum TTSEventType {
    RECIEVED_RESPONSE,
    SEND_RESPONSE,
    AUDIO_RECIEVED,
    SEND_FRAME,
}