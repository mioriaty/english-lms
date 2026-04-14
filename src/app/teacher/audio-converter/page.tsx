import { AudioConverterContainer } from "@/containers/audio-converter/components/audio-converter-container";

export const metadata = {
  title: "Audio Converter | Teacher",
  description: "Convert M3U8 streams or video files to MP3",
};

export default function AudioConverterPage() {
  return <AudioConverterContainer />;
}
