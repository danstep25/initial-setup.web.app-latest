import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { BaseModule } from '../../modules/base.module';
import { MatSelect, MatSelectModule } from "@angular/material/select";

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [BaseModule, MatSelectModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
})
export class PaginatorComponent {
  @Input({ required: true }) records: number;
  @Input({ required: true }) entries: number;
  @Input({ required: true }) pageIndex: number;
  @Input({ required: true }) pageSize: number;
  @Output() page = new EventEmitter<PageEvent>();

  get totalPageIndex(): number {
    return (
      Math.ceil(this.records / this.pageSize) -
      (this.records % this.pageSize === 0 ? 1 : 0)
    );
  }

  displayPaginatorDetails(): string {
    const pageIndex = this.pageIndex * this.pageSize;
    const toRecords =
      (this.pageIndex + 1) * this.pageSize < this.records
        ? (this.pageIndex + 1) * this.pageSize
        : this.records;
    const recordWork = this.records > 1 ? 'records' : 'record';
    return `Showing ${(pageIndex - this.pageSize) + 1} to`;
  }

  displayPaginatorDetails2(): string{
    const pageIndex = this.pageIndex * this.pageSize;
    const toRecords =
      (this.pageIndex + 1) * this.pageSize < this.records
        ? (this.pageIndex + 1) * this.pageSize
        : this.records;
    const recordWork = this.records > 1 ? 'records' : 'record';
    return ` of ${this.records
      } ${recordWork} ${this.records != this.entries
        ? `(filtered from ${this.entries} entries)`
        : ''
      }`;
  }

  goToFirstPage(): void {
    const pageEvent: PageEvent = {
      pageIndex: 1,
      previousPageIndex: this.pageIndex ?? null,
      pageSize: this.pageSize,
      length: length,
    };

    this.page.emit(pageEvent);
  }

  previousPage(): void {
    const pageEvent: PageEvent = {
      pageIndex: this.pageIndex - 1,
      previousPageIndex: this.pageIndex ?? null,
      pageSize: this.pageSize,
      length: length,
    };

    this.page.emit(pageEvent);
  }

  nextPage(): void {
    const pageEvent: PageEvent = {
      pageIndex: this.pageIndex + 1,
      previousPageIndex: this.pageIndex ?? null,
      pageSize: this.pageSize,
      length: length,
    };
    this.page.emit(pageEvent);
  }

  goToLastPage(): void {
    const pageEvent: PageEvent = {
      pageIndex: this.totalPageIndex,
      previousPageIndex: this.pageIndex ?? null,
      pageSize: this.pageSize,
      length: length,
    };

    this.page.emit(pageEvent);
  }

  onPageSizeChange(pageSize:string) {
    const pageEvent: PageEvent = {
      pageIndex: 1,
      previousPageIndex: this.pageIndex ?? null,
      pageSize: Number(pageSize),
      length: length
    }

    this.page.emit(pageEvent);
  }

  pageNumber(pageIndex): void {
    const pageEvent: PageEvent = {
      pageIndex,
      previousPageIndex: this.pageIndex ?? null,
      pageSize: this.pageSize,
      length: length,
    };

    this.page.emit(pageEvent);
  }
}
