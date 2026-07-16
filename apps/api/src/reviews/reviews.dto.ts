import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SubmitReviewDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

export class AssignReviewerDto {
  @IsUUID()
  reviewerId!: string;
}

export class ReviewDecisionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  comment!: string;
}
