"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export function AudioRecorder({
  onRecordingComplete,
  disabled,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        onRecordingComplete(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      alert(
        "No se pudo acceder al micrófono. Asegúrate de dar permiso en tu navegador."
      );
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-200 focus:outline-none focus:ring-4
          ${
            isRecording
              ? "bg-orange-500 hover:bg-orange-600 focus:ring-orange-200 animate-pulse"
              : "bg-primary hover:bg-primary/90 focus:ring-primary/20"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-label={isRecording ? "Parar grabación" : "Grabar audio"}
      >
        {isRecording ? (
          <Square className="h-8 w-8 text-white" fill="white" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </button>

      {isRecording && (
        <div className="flex items-center gap-2 text-orange-600 font-medium">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          Grabando... {formatTime(duration)}
        </div>
      )}

      {!isRecording && (
        <p className="text-sm text-gray-500">
          Pulsa para grabar lo que has hecho y cuánto cobras
        </p>
      )}
    </div>
  );
}
