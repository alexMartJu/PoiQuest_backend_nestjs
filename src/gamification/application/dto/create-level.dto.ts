export interface CreateLevelDto {
  level: number;
  title: string;
  minPoints: number;
  discount?: number;
  reward?: string | null;
}
