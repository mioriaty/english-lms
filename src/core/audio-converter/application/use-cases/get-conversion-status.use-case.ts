import type {
  ConversionJob,
  IAudioConverterRepository,
} from "../../domain/repositories/audio-converter.repository";

export class GetConversionStatusUseCase {
  constructor(private readonly repository: IAudioConverterRepository) {}

  execute(jobId: string): Promise<ConversionJob | null> {
    return this.repository.getJob(jobId);
  }
}
