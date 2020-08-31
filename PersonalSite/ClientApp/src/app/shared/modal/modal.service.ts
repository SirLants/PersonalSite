import { Injectable } from '@angular/core';
import { ModalComponent } from './modal.component';

@Injectable()
export class ModalService {
  private modals: { [modalId: string]: ModalComponent };

  constructor() {
    this.modals = {};
  }

  registerModal(newModal: ModalComponent): void {
    this.modals[newModal.modalId] = newModal;
  }

  open(modalId: string): void {
    const modal = this.modals[modalId];

    if (modal) {
      modal.isModalOpen = true;
    }
  }

  close(modalId: string, checkBlocking = false): void {
    const modal = this.modals[modalId];

    if (modal) {
      if (checkBlocking && modal.blocking) {
        return;
      }

      modal.isModalOpen = false;
    }
  }
}
