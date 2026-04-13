import type {
  ConversionJob,
  CreateJobInput,
  IAudioConverterRepository,
} from "../../domain/repositories/audio-converter.repository";

export class CreateConversionJobUseCase {
  constructor(private readonly repository: IAudioConverterRepository) {}

  execute(input: CreateJobInput): Promise<ConversionJob> {
    if (!input.sourceUrl && !input.sourceFilePath) {
      throw new Error("Either sourceUrl or sourceFilePath is required");
    }
    return this.repository.createJob(input);
  }
}
