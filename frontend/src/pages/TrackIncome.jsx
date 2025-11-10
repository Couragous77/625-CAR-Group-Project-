import { useState } from 'react';
import Layout from '../components/Layout';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import '../styles/trackExpense.css'; // Reuse expense styles

function TrackIncome() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="track-expense-container">
        <header className="page-header">
          <h1>Track Income</h1>
          <p>Manage your income sources and earnings</p>
        </header>

        <ExpenseForm 
          transactionType="income"
          onSuccess={handleSuccess} 
        />
        
        <ExpenseList 
          transactionType="income"
          refreshKey={refreshKey}
        />
      </div>
    </Layout>
  );
}

export default TrackIncome;
