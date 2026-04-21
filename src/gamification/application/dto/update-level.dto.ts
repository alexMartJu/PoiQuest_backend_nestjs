export interface UpdateLevelDto {
  level?: number;
  title?: string;
  minPoints?: number;
  discount?: number;
  reward?: string | null;
}
