import { useState } from 'react';
import Layout from '../components/Layout';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import '../styles/trackTransaction.css';

function TrackIncome() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="track-transaction-page">
      <div className="page-header">
        <h1>Income Tracker</h1>
        <p className="subtitle">Manage your income sources and earnings</p>
      </div>

      {/* Add Income Form */}
      <section className="panel">
        <h2>Add New Income</h2>
        <TransactionForm
          transactionType="income"
          onSuccess={handleSuccess}
        />
      </section>

      {/* Income List */}
      <section className="panel">
        <h2>Your Income</h2>
        <TransactionList
          transactionType="income"
          refreshKey={refreshKey}
        />
      </section>
    </div>
  );
}

export default TrackIncome;
