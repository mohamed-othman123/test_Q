import {NgModule} from '@angular/core';
import {CommentService} from './services/comment.service';
import {CommentsComponent} from './containers/comments/comments.component';
import {CommonModule} from '@angular/common';
import {CommentItemComponent} from './components/comment-item/comment-item.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InfiniteScrollDirective} from 'ngx-infinite-scroll';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [CommentsComponent, CommentItemComponent],
  providers: [CommentService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InfiniteScrollDirective,
    TranslateModule,
  ],
  exports: [CommentsComponent],
})
export class CommentsModule {}
