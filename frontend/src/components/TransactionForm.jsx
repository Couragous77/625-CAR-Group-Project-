import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createTransaction, updateTransaction } from '../services/transactionService';
import { listCategories, createCategory } from '../services/categoryService';
import { getTodayString, toISOString } from '../utils/date';
import { dollarsToCents, centsToDollars } from '../utils/currency';
import Spinner from './Spinner';
import '../styles/transactionForm.css';

export default function TransactionForm({ transaction = null, onSuccess, onCancel, transactionType = 'expense' }) {
  const { getToken } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    occurred_at: getTodayString(),
    description: '',
  });
  
  // Error state
  const [errors, setErrors] = useState({});
  
  // Load initial data
  useEffect(() => {
    loadCategories();
    
    // If editing, populate form
    if (transaction) {
      setFormData({
        amount: centsToDollars(transaction.amount_cents).toFixed(2),
        category_id: transaction.category_id || '',
        occurred_at: transaction.occurred_at.split('T')[0],
        description: transaction.description || '',
      });
    }
  }, [transaction]);
  
  async function loadCategories() {
    try {
      setLoadingCategories(true);
      const token = getToken();
      const cats = await listCategories(token);
      // Filter categories by transaction type
      const filteredCats = cats.filter(cat => cat.type === transactionType);
      setCategories(filteredCats);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  }
  
  function validateForm() {
    const newErrors = {};
    
    // Amount validation
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = 'Amount is required';
    } else if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    // Category validation
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    
    // Date validation
    if (!formData.occurred_at) {
      newErrors.occurred_at = 'Date is required';
    } else {
      const selectedDate = new Date(formData.occurred_at);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (selectedDate > today) {
        newErrors.occurred_at = 'Date cannot be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const token = getToken();
      
      const payload = {
        type: transactionType,
        amount_cents: dollarsToCents(formData.amount),
        category_id: formData.category_id,
        occurred_at: toISOString(formData.occurred_at),
        description: formData.description || null,
      };
      
      const itemName = transactionType === 'income' ? 'Income' : 'Expense';
      
      if (transaction) {
        // Update existing
        await updateTransaction(transaction.id, payload, token);
        toast.success(`${itemName} updated successfully`);
      } else {
        // Create new
        await createTransaction(payload, token);
        toast.success(`${itemName} added successfully`);
      }
      
      // Reset form
      setFormData({
        amount: '',
        category_id: '',
        occurred_at: getTodayString(),
        description: '',
      });
      setErrors({});
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleCreateCategory() {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      const token = getToken();
      const newCat = await createCategory({ 
        name: newCategoryName, 
        type: transactionType 
      }, token);
      setCategories([...categories, newCat]);
      setFormData({ ...formData, category_id: newCat.id });
      setNewCategoryName('');
      setShowNewCategory(false);
      toast.success('Category created');
    } catch (error) {
      toast.error('Failed to create category');
    }
  }
  
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }
  
  if (loadingCategories) {
    return <Spinner size="small" message="Loading..." />;
  }
  
  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      {/* Amount */}
      <div className="field">
        <label htmlFor="amount">
          Amount <span className="required">*</span>
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="e.g., 12.99"
          value={formData.amount}
          onChange={handleChange}
          className={errors.amount ? 'error' : ''}
          disabled={loading}
        />
        {errors.amount && <span className="error-message">{errors.amount}</span>}
      </div>
      
      {/* Category */}
      <div className="field">
        <label htmlFor="category_id">
          Category <span className="required">*</span>
        </label>
        {!showNewCategory ? (
          <div className="category-select-wrapper">
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={errors.category_id ? 'error' : ''}
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-link"
              onClick={() => setShowNewCategory(true)}
              disabled={loading}
            >
              + New Category
            </button>
          </div>
        ) : (
          <div className="new-category-input">
            <input
              type="text"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
            />
            <button type="button" className="btn secondary small" onClick={handleCreateCategory}>
              Add
            </button>
            <button
              type="button"
              className="btn secondary small"
              onClick={() => setShowNewCategory(false)}
            >
              Cancel
            </button>
          </div>
        )}
        {errors.category_id && <span className="error-message">{errors.category_id}</span>}
      </div>
      
      {/* Date */}
      <div className="field">
        <label htmlFor="occurred_at">
          Date <span className="required">*</span>
        </label>
        <input
          id="occurred_at"
          name="occurred_at"
          type="date"
          max={getTodayString()}
          value={formData.occurred_at}
          onChange={handleChange}
          className={errors.occurred_at ? 'error' : ''}
          disabled={loading}
        />
        {errors.occurred_at && <span className="error-message">{errors.occurred_at}</span>}
      </div>
      
      {/* Description */}
      <div className="field">
        <label htmlFor="description">Description (optional)</label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="e.g., Coffee at campus"
          maxLength={200}
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      
      {/* Actions */}
      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Saving...' : transaction ? `Update ${transactionType === 'income' ? 'Income' : 'Expense'}` : `Add ${transactionType === 'income' ? 'Income' : 'Expense'}`}
        </button>
        {onCancel && (
          <button type="button" className="btn secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
