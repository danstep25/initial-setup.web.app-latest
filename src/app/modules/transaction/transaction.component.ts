import { Component } from '@angular/core';
import { TransactionListComponent } from './transaction-list/transaction-list.component';

@Component({
  selector: 'app-transaction',
  imports: [TransactionListComponent],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent {
readonly labels = {
    title: 'Transaction',
  };
}
