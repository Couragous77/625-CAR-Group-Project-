import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';
import { formatCurrency, dollarsToCents, centsToDollars } from '../utils/currency';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import '../styles/trackTransaction.css';

function Envelopes() {
  const { getToken } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [envelopes, setEnvelopes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState(null);
  const [deletingEnvelope, setDeletingEnvelope] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    monthly_limit: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load envelopes on mount
  useEffect(() => {
    loadEnvelopes();
  }, []);

  async function loadEnvelopes() {
    try {
      setLoading(true);
      const token = getToken();
      const cats = await listCategories(token);
      setEnvelopes(cats);
    } catch (error) {
      toast.error('Failed to load envelopes');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setFormData({ name: '', type: 'expense', monthly_limit: '' });
    setFormErrors({});
    setShowCreateModal(true);
  }

  function openEditModal(envelope) {
    setEditingEnvelope(envelope);
    setFormData({
      name: envelope.name,
      type: envelope.type,
      monthly_limit: envelope.monthly_limit_cents
        ? centsToDollars(envelope.monthly_limit_cents).toFixed(2)
        : '',
    });
    setFormErrors({});
    setShowEditModal(true);
  }

  function openDeleteModal(envelope) {
    setDeletingEnvelope(envelope);
    setShowDeleteModal(true);
  }

  function validateForm() {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.type) {
      errors.type = 'Type is required';
    }

    if (formData.monthly_limit) {
      const limit = parseFloat(formData.monthly_limit);
      if (isNaN(limit) || limit < 0) {
        errors.monthly_limit = 'Monthly limit must be a positive number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate() {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = getToken();

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        monthly_limit_cents: formData.monthly_limit
          ? dollarsToCents(formData.monthly_limit)
          : null,
        is_default: false,
      };

      await createCategory(payload, token);
      toast.success('Envelope created successfully');
      setShowCreateModal(false);
      loadEnvelopes();
    } catch (error) {
      toast.error(error.message || 'Failed to create envelope');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = getToken();

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        monthly_limit_cents: formData.monthly_limit
          ? dollarsToCents(formData.monthly_limit)
          : null,
        is_default: editingEnvelope.is_default,
      };

      await updateCategory(editingEnvelope.id, payload, token);
      toast.success('Envelope updated successfully');
      setShowEditModal(false);
      loadEnvelopes();
    } catch (error) {
      toast.error(error.message || 'Failed to update envelope');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      setSubmitting(true);
      const token = getToken();
      await deleteCategory(deletingEnvelope.id, token);
      toast.success('Envelope deleted successfully');
      setShowDeleteModal(false);
      loadEnvelopes();
    } catch (error) {
      toast.error(error.message || 'Failed to delete envelope');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  if (loading) {
    return <Spinner message="Loading envelopes..." />;
  }

  return (
    <div className="track-transaction-page">
      <div className="page-header">
        <h1>Budget Envelopes</h1>
        <p className="subtitle">
          Manage your budget categories with monthly spending limits
        </p>
      </div>

      {/* Create Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn primary" onClick={openCreateModal}>
          + Create Envelope
        </button>
      </div>

      {/* Envelopes List */}
      <div className="panel">
        <h2>Your Envelopes</h2>

        {envelopes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p className="muted" style={{ marginBottom: '1rem' }}>
              No envelopes created yet. Create your first budget envelope to start
              tracking your spending!
            </p>
            <button className="btn primary" onClick={openCreateModal}>
              Create Your First Envelope
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {envelopes.map((envelope) => (
              <div
                key={envelope.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1.125rem' }}>{envelope.name}</strong>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        backgroundColor: envelope.type === 'income' ? '#dcfce7' : '#fee2e2',
                        color: envelope.type === 'income' ? '#166534' : '#991b1b',
                        fontWeight: '600',
                      }}
                    >
                      {envelope.type}
                    </span>
                    {envelope.is_default && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          fontWeight: '600',
                        }}
                      >
                        default
                      </span>
                    )}
                  </div>
                  
                  {envelope.monthly_limit_cents ? (
                    <p className="muted" style={{ margin: 0, fontSize: '0.9375rem' }}>
                      Monthly Limit: <strong>{formatCurrency(envelope.monthly_limit_cents)}</strong>
                    </p>
                  ) : (
                    <p className="muted" style={{ margin: 0, fontSize: '0.9375rem' }}>
                      No monthly limit set
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn secondary small"
                    onClick={() => openEditModal(envelope)}
                  >
                    Edit
                  </button>
                  {!envelope.is_default && (
                    <button
                      className="btn danger small"
                      onClick={() => openDeleteModal(envelope)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Envelope"
        size="medium"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="field">
            <label htmlFor="create-name">
              Envelope Name <span className="required">*</span>
            </label>
            <input
              id="create-name"
              name="name"
              type="text"
              placeholder="e.g., Groceries, Entertainment"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? 'error' : ''}
              disabled={submitting}
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="create-type">
              Type <span className="required">*</span>
            </label>
            <select
              id="create-type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={formErrors.type ? 'error' : ''}
              disabled={submitting}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            {formErrors.type && <span className="error-message">{formErrors.type}</span>}
          </div>

          <div className="field">
            <label htmlFor="create-limit">
              Monthly Limit (optional)
            </label>
            <input
              id="create-limit"
              name="monthly_limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 500.00"
              value={formData.monthly_limit}
              onChange={handleChange}
              className={formErrors.monthly_limit ? 'error' : ''}
              disabled={submitting}
            />
            {formErrors.monthly_limit && (
              <span className="error-message">{formErrors.monthly_limit}</span>
            )}
            <small className="muted">
              Set a monthly spending limit for this envelope
            </small>
          </div>

          <div className="form-actions">
            <button
              className="btn primary"
              onClick={handleCreate}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Envelope'}
            </button>
            <button
              className="btn secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Envelope"
        size="medium"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="field">
            <label htmlFor="edit-name">
              Envelope Name <span className="required">*</span>
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              placeholder="e.g., Groceries, Entertainment"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? 'error' : ''}
              disabled={submitting}
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="edit-type">
              Type <span className="required">*</span>
            </label>
            <select
              id="edit-type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={formErrors.type ? 'error' : ''}
              disabled={submitting}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            {formErrors.type && <span className="error-message">{formErrors.type}</span>}
          </div>

          <div className="field">
            <label htmlFor="edit-limit">
              Monthly Limit (optional)
            </label>
            <input
              id="edit-limit"
              name="monthly_limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 500.00"
              value={formData.monthly_limit}
              onChange={handleChange}
              className={formErrors.monthly_limit ? 'error' : ''}
              disabled={submitting}
            />
            {formErrors.monthly_limit && (
              <span className="error-message">{formErrors.monthly_limit}</span>
            )}
            <small className="muted">
              Set a monthly spending limit for this envelope
            </small>
          </div>

          <div className="form-actions">
            <button
              className="btn primary"
              onClick={handleUpdate}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Envelope'}
            </button>
            <button
              className="btn secondary"
              onClick={() => setShowEditModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Envelope"
        size="small"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>
            Are you sure you want to delete the envelope <strong>{deletingEnvelope?.name}</strong>?
          </p>
          <p className="muted" style={{ fontSize: '0.9375rem' }}>
            This action cannot be undone. You can only delete envelopes that are not used
            in any transactions.
          </p>

          <div className="delete-actions">
            <button
              className="btn danger"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              className="btn secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Envelopes;
