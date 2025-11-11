import { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import '../styles/trackTransaction.css';

function TrackExpense() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="track-transaction-page">
      <div className="page-header">
        <h1>Expense Tracker</h1>
        <p className="subtitle">Track and manage your expenses</p>
      </div>

      {/* Add Expense Form */}
      <section className="panel">
        <h2>Add New Expense</h2>
        <TransactionForm
          transactionType="expense"
          onSuccess={handleSuccess}
        />
      </section>

      {/* Expense List */}
      <section className="panel">
        <h2>Your Expenses</h2>
        <TransactionList
          transactionType="expense"
          refreshKey={refreshKey}
        />
      </section>
    </div>
  );
}

export default TrackExpense;
