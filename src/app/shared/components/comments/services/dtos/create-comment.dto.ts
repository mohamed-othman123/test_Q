import {CommentType} from '../../models/comment';

export interface CreateCommentDto {
  content: string;
  entityId: number;
  type: CommentType;
  hallId: number;
}
