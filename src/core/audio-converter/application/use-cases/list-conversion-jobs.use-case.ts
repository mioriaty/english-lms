import type {
  ConversionJob,
  IAudioConverterRepository,
} from "../../domain/repositories/audio-converter.repository";

export class ListConversionJobsUseCase {
  constructor(private readonly repository: IAudioConverterRepository) {}

  execute(): Promise<ConversionJob[]> {
    return this.repository.listJobs();
  }
}
