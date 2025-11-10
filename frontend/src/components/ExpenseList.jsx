import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { listTransactions, deleteTransaction } from '../services/transactionService';
import { listCategories } from '../services/categoryService';
import { formatDate } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import Spinner from './Spinner';
import Modal from './Modal';
import ExpenseForm from './ExpenseForm';
import '../styles/expenseList.css';

export default function ExpenseList({ refreshKey = 0, transactionType = 'expense' }) {
  const { getToken } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  const [categories, setCategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);
  
  // Filters from URL
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 20;
  const sortBy = searchParams.get('sort_by') || 'occurred_at';
  const sortOrder = searchParams.get('sort_order') || 'desc';
  const categoryId = searchParams.get('category_id') || '';
  const search = searchParams.get('search') || '';
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';
  const minAmount = searchParams.get('min_amount') || '';
  const maxAmount = searchParams.get('max_amount') || '';
  
  // Load data
  useEffect(() => {
    loadExpenses();
  }, [searchParams, refreshKey]);
  
  useEffect(() => {
    loadCategories();
  }, [transactionType]);
  
  async function loadExpenses() {
    try {
      setLoading(true);
      const token = getToken();
      
      const params = {
        type: transactionType,
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      
      if (categoryId) params.category_id = categoryId;
      if (search) params.search = search;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (minAmount) params.min_amount = Math.round(parseFloat(minAmount) * 100);
      if (maxAmount) params.max_amount = Math.round(parseFloat(maxAmount) * 100);
      
      const response = await listTransactions(params, token);
      setExpenses(response.items || []);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.total_pages,
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }
  
  async function loadCategories() {
    try {
      const token = getToken();
      const cats = await listCategories(token);
      // Filter by transaction type
      const filteredCats = cats.filter(cat => cat.type === transactionType);
      setCategories(filteredCats);
    } catch (error) {
      // Silent fail, not critical
    }
  }
  
  function updateQueryParam(key, value) {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when filters change (except when changing page itself)
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  }
  
  function handleSort(field) {
    if (sortBy === field) {
      // Toggle order
      updateQueryParam('sort_order', sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      updateQueryParam('sort_by', field);
      updateQueryParam('sort_order', 'desc');
    }
  }
  
  function handleEdit(expense) {
    setEditingExpense(expense);
    setShowEditModal(true);
  }
  
  function handleDelete(expense) {
    setDeletingExpense(expense);
    setShowDeleteConfirm(true);
  }
  
  async function confirmDelete() {
    try {
      const token = getToken();
      await deleteTransaction(deletingExpense.id, token);
      toast.success('Expense deleted');
      setShowDeleteConfirm(false);
      setDeletingExpense(null);
      loadExpenses(); // Refresh list
    } catch (error) {
      toast.error(error.message || 'Failed to delete expense');
    }
  }
  
  function getCategoryName(categoryId) {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  }
  
  if (loading && expenses.length === 0) {
    return <Spinner message={`Loading ${transactionType === 'income' ? 'income' : 'expenses'}...`} />;
  }
  
  return (
    <div className="expense-list">
      {/* Filters */}
      <div className="expense-filters">
        <div className="filter-row">
          <input
            type="search"
            placeholder="Search description..."
            value={search}
            onChange={(e) => updateQueryParam('search', e.target.value)}
            className="filter-search"
          />
          
          <select
            value={categoryId}
            onChange={(e) => updateQueryParam('category_id', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => updateQueryParam('start_date', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => updateQueryParam('end_date', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Min $</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={minAmount}
              onChange={(e) => updateQueryParam('min_amount', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Max $</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={maxAmount}
              onChange={(e) => updateQueryParam('max_amount', e.target.value)}
            />
          </div>
        </div>
        
        {/* Clear filters button */}
        {(search || categoryId || startDate || endDate || minAmount || maxAmount) && (
          <button
            className="btn secondary small"
            onClick={() => setSearchParams({})}
          >
            Clear Filters
          </button>
        )}
      </div>
      
      {/* Table */}
      <div className="table-container">
        <table className="expense-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('occurred_at')} className="sortable">
                Date {sortBy === 'occurred_at' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('amount_cents')} className="sortable">
                Amount {sortBy === 'amount_cents' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th>Category</th>
              <th>Description</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  {loading ? 'Loading...' : `No ${transactionType === 'income' ? 'income' : 'expenses'} found`}
                </td>
              </tr>
            ) : (
              expenses.map(expense => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.occurred_at)}</td>
                  <td className="amount">{formatCurrency(expense.amount_cents)}</td>
                  <td>{getCategoryName(expense.category_id)}</td>
                  <td className="description">{expense.description || '—'}</td>
                  <td className="actions-col">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(expense)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(expense)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn secondary small"
            disabled={pagination.page === 1}
            onClick={() => updateQueryParam('page', pagination.page - 1)}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          
          <button
            className="btn secondary small"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => updateQueryParam('page', pagination.page + 1)}
          >
            Next
          </button>
          
          <select
            value={limit}
            onChange={(e) => updateQueryParam('limit', e.target.value)}
            className="pagination-select"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      )}
      
      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${transactionType === 'income' ? 'Income' : 'Expense'}`}
        size="medium"
      >
        <ExpenseForm
          transaction={editingExpense}
          transactionType={transactionType}
          onSuccess={() => {
            setShowEditModal(false);
            loadExpenses();
          }}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
      
      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={`Delete ${transactionType === 'income' ? 'Income' : 'Expense'}`}
        size="small"
      >
        <div className="delete-confirm">
          <p>Are you sure you want to delete this {transactionType === 'income' ? 'income' : 'expense'}?</p>
          {deletingExpense && (
            <div className="delete-expense-details">
              <strong>{formatCurrency(deletingExpense.amount_cents)}</strong>
              <span>{getCategoryName(deletingExpense.category_id)}</span>
              <span>{formatDate(deletingExpense.occurred_at)}</span>
            </div>
          )}
          <div className="delete-actions">
            <button className="btn danger" onClick={confirmDelete}>
              Delete
            </button>
            <button className="btn secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
