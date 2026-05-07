import { useState } from 'react';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'refunded';
  date: string;
  planName: string;
  paymentMethod: string;
  invoiceUrl?: string;
}

const initialTransactions: Transaction[] = [
  { id: 'tx_1', userId: 'usr_1', userName: 'Alice Smith', userEmail: 'alice@example.com', amount: 29.00, currency: 'USD', status: 'succeeded', date: '2026-05-01T10:23:00Z', planName: 'Pro', paymentMethod: 'Visa ending in 4242' },
  { id: 'tx_2', userId: 'usr_2', userName: 'Bob Jones', userEmail: 'bob@example.com', amount: 9.00, currency: 'USD', status: 'failed', date: '2026-05-02T14:45:00Z', planName: 'Basic', paymentMethod: 'Mastercard ending in 1234' },
  { id: 'tx_3', userId: 'usr_4', userName: 'Diana Prince', userEmail: 'diana@example.com', amount: 99.00, currency: 'USD', status: 'refunded', date: '2026-04-28T09:12:00Z', planName: 'Enterprise', paymentMethod: 'Amex ending in 9876' }
];

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  
  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToRefund, setTransactionToRefund] = useState<Transaction | null>(null);

  const fetchTransactions = () => {
    // In a real app, this would fetch from an API
    return transactions;
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchSearch = tx.userName.toLowerCase().includes(filters.search.toLowerCase()) || 
                        tx.userEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
                        tx.id.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.status === 'all' || tx.status === filters.status;
    return matchSearch && matchStatus;
  });

  const refundTransaction = (id: string, reason: string) => {
    // In a real app, API call to refund using reason
    console.log(`Refunding ${id} due to ${reason}`);
    setTransactions(txs => txs.map(tx => tx.id === id ? { ...tx, status: 'refunded' } : tx));
    setIsRefundModalOpen(false);
    setTransactionToRefund(null);
  };

  const openDetailsModal = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsDetailsModalOpen(true);
  };

  const openRefundModal = (tx: Transaction) => {
    setTransactionToRefund(tx);
    setIsRefundModalOpen(true);
  };

  return {
    transactions: filteredTransactions,
    fetchTransactions,
    filters,
    setFilters,
    refundTransaction,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    selectedTransaction,
    openDetailsModal,
    isRefundModalOpen,
    setIsRefundModalOpen,
    transactionToRefund,
    openRefundModal
  };
};
