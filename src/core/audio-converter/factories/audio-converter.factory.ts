import { AudioConverterRepositoryImpl } from "@/containers/audio-converter/infrastructure/repositories/audio-converter.repository.impl";
import { CreateConversionJobUseCase } from "../application/use-cases/create-conversion-job.use-case";
import { GetConversionStatusUseCase } from "../application/use-cases/get-conversion-status.use-case";
import { ListConversionJobsUseCase } from "../application/use-cases/list-conversion-jobs.use-case";

// Singleton repository — keeps job store alive across API calls
const audioConverterRepository = new AudioConverterRepositoryImpl();

export const createConversionJobUseCase = new CreateConversionJobUseCase(
  audioConverterRepository
);

export const getConversionStatusUseCase = new GetConversionStatusUseCase(
  audioConverterRepository
);

export const listConversionJobsUseCase = new ListConversionJobsUseCase(
  audioConverterRepository
);

// Re-export for direct use
export { audioConverterRepository };
