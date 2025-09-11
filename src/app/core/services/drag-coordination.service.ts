import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DragCoordinationService {
  private activeDragId: string | null = null;

  /**
   * Start a drag operation
   * @param dragId Unique identifier for this drag operation
   */
  startDrag(dragId: string): void {
    this.activeDragId = dragId;
  }

  /**
   * End the current drag operation
   */
  endDrag(): void {
    this.activeDragId = null;
  }

  /**
   * Check if a specific drag operation is active
   * @param dragId The drag ID to check
   */
  isDragActive(dragId: string): boolean {
    return this.activeDragId === dragId;
  }

  /**
   * Check if any drag operation is active
   */
  isAnyDragActive(): boolean {
    return this.activeDragId !== null;
  }

  /**
   * Check if a drag operation should be disabled
   * @param dragId The drag ID to check
   * @param parentDragId The parent drag ID (if this is a child)
   */
  shouldDisableDrag(dragId: string, parentDragId?: string): boolean {
    if (!this.isAnyDragActive()) {
      return false;
    }

    // If this is the active drag, don't disable it
    if (this.isDragActive(dragId)) {
      return false;
    }

    // If this is a child drag and parent is active, disable child
    if (parentDragId && this.isDragActive(parentDragId)) {
      return true;
    }

    // If this is a parent drag and any child is active, disable parent
    if (parentDragId === undefined && this.activeDragId !== dragId) {
      return true;
    }

    return false;
  }
}
