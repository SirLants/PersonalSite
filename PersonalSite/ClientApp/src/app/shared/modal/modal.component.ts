import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ModalService } from './modal.service';

@Component({
  selector: 'ga-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() modalId: string;
  @Input() modalTitle: string;
  @Input() blocking = false;
  @Input() classname: string;
  @Input() styles: any;
  @Input() bodyStyles = {};
  @Input() bodyClasses = {};
  @Input() footerClasses = {};
  @Input() showHeader = true;
  @Input() showFooter = true;
  isOpen = false;

  @Output() triggerModal = new EventEmitter();
  get isModalOpen() {
    return this.isOpen;
  }
  set isModalOpen(value: boolean) {
    this.isOpen = value;

    this.triggerModal.emit(this.isOpen);
  }

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.modalService.registerModal(this);
  }

  close(checkBlocking = false): void {
    this.modalService.close(this.modalId, checkBlocking);
  }
}
