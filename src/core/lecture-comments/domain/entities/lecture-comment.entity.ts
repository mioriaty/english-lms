export interface LectureComment {
  id: string;
  content: string;
  mentionedUsernames: string[];
  createdAt: Date;
  updatedAt: Date;
  lectureId: string;
  authorId: string;
  parentId: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaName?: string | null;
}

export interface CommentAuthor {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface CommentWithAuthor extends LectureComment {
  author: CommentAuthor;
  replies: ReplyWithAuthor[];
}

export interface ReplyWithAuthor extends LectureComment {
  author: CommentAuthor;
}

export interface CreateCommentInput {
  content: string;
  mentionedUsernames: string[];
  lectureId: string;
  authorId: string;
  parentId?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaName?: string | null;
}
