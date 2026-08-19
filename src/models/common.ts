/** Common reusable domain types. */
import type { ErrorCode } from '../common/app-error';

export interface Identifiable {
  id: string;
}

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

type SystemFields = keyof Identifiable | keyof Timestamped;

/** Builds an input DTO by removing server-managed fields from an entity. */
export type CreateDto<TEntity extends Identifiable & Timestamped, TOptional extends keyof TEntity = never> =
  Omit<TEntity, SystemFields | TOptional> & Partial<Pick<TEntity, TOptional>>;

/** Represents a partial update of an existing create DTO. */
export type UpdateDto<TCreate extends object> = Partial<TCreate>;

export interface PaginatedResponse<TItem> {
  data: TItem[];
  total: number;
  limit: number;
  offset: number;
}

export type ApiSuccessResponse<TData = void> = [TData] extends [void]
  ? { success: true; message?: string }
  : { success: true; data: TData; message?: string };

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    statusCode: number;
    message: string;
  };
}

/** Generic persistence contract shared by domain repositories. */
export interface CrudStore<TEntity, TCreate, TUpdate, TFilters> {
  getAll(filters: TFilters): Promise<PaginatedResponse<TEntity>>;
  getById(id: string): Promise<TEntity | undefined>;
  create(dto: TCreate): Promise<TEntity>;
  update(id: string, dto: TUpdate): Promise<TEntity | undefined>;
  delete(id: string): Promise<boolean>;
}
