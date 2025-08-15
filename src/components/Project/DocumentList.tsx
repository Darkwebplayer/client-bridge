import React, { useState } from 'react';
import { FileText, ExternalLink, Plus, DollarSign, Clock, CheckCircle, AlertCircle, Download, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Document } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useDocuments } from '../../hooks/useDocuments';
import { AddDocumentModal } from './AddDocumentModal';
import { EditDocumentModal } from './EditDocumentModal';

interface DocumentListProps {
  projectId: string;
}

const typeIcons = {
  invoice: DollarSign,
  contract: FileText,
  proposal: FileText
};

const statusIcons = {
  paid: CheckCircle,
  pending: Clock,
  overdue: AlertCircle,
  draft: FileText
};

const statusColors = {
  paid: 'text-green-600 bg-green-100',
  pending: 'text-yellow-600 bg-yellow-100',
  overdue: 'text-red-600 bg-red-100',
  draft: 'text-gray-600 bg-gray-100'
};

const statusLabels = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
  draft: 'Draft'
};

const typeLabels = {
  invoice: 'Invoice',
  contract: 'Contract',
  proposal: 'Proposal'
};

export const DocumentList: React.FC<DocumentListProps> = ({ projectId }) => {
  const { user } = useAuth();
  const { documents, loading, error, deleteDocument } = useDocuments(projectId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (doc: Document) => {
    return doc.dueDate && doc.status === 'pending' && new Date() > doc.dueDate;
  };

  const totalAmount = documents
    .filter(d => d.amount && d.status === 'paid')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const pendingAmount = documents
    .filter(d => d.amount && d.status === 'pending')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const handleEdit = (document: Document) => {
    setSelectedDocument(document);
    setShowEditModal(true);
    setShowDropdown(null);
  };

  const handleDelete = async (document: Document) => {
    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) return;
    
    try {
      await deleteDocument(document.id);
      setShowDropdown(null);
    } catch (err: any) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedDocument(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error loading documents: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          <p className="text-sm text-gray-600 mt-1">
            {documents.length} documents • {formatAmount(totalAmount)} paid
            {pendingAmount > 0 && ` • ${formatAmount(pendingAmount)} pending`}
          </p>
        </div>
        {user?.role === 'freelancer' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {documents.some(d => d.amount) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">Total Paid</p>
                <p className="text-lg font-bold text-green-900">{formatAmount(totalAmount)}</p>
              </div>
            </div>
          </div>
          {pendingAmount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Pending Payment</p>
                  <p className="text-lg font-bold text-yellow-900">{formatAmount(pendingAmount)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600 mb-6">
              {user?.role === 'freelancer' 
                ? 'Add invoices, contracts, and proposals to keep everything organized'
                : 'Documents will appear here when shared by your freelancer'
              }
            </p>
            {user?.role === 'freelancer' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => {
              const TypeIcon = typeIcons[doc.type];
              const StatusIcon = statusIcons[doc.status];
              const actualStatus = isOverdue(doc) ? 'overdue' : doc.status;
              const ActualStatusIcon = statusIcons[actualStatus];
              
              return (
                <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {doc.title}
                          </h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {typeLabels[doc.type]}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Created {formatDate(doc.createdAt)}</span>
                          {doc.dueDate && (
                            <span className={isOverdue(doc) ? 'text-red-600 font-medium' : ''}>
                              Due {formatDate(doc.dueDate)}
                            </span>
                          )}
                          {doc.amount && (
                            <div className="flex items-center font-medium text-gray-900">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {formatAmount(doc.amount)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[actualStatus]}`}>
                        <ActualStatusIcon className="w-3 h-3 mr-1" />
                        {actualStatus === 'overdue' ? 'Overdue' : statusLabels[doc.status]}
                      </div>
                      
                      <div className="flex items-center">
                        <a
                          href={doc.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          title="View document"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        {user?.role === 'freelancer' && (
                          <div className="relative">
                            <button
                              onClick={() => setShowDropdown(showDropdown === doc.id ? null : doc.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                              title="More options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {showDropdown === doc.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                <button
                                  onClick={() => handleEdit(doc)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                  <Edit className="w-4 h-4 mr-3" />
                                  Edit Document
                                </button>
                                <button
                                  onClick={() => handleDelete(doc)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                  <Trash2 className="w-4 h-4 mr-3" />
                                  Delete Document
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        projectId={projectId}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Document Modal */}
      {selectedDocument && (
        <EditDocumentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
};