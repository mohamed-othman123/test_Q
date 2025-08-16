import {Comment} from '../../models/comment';

export interface UpdateCommentDto {
  content: Comment['content'];
}
