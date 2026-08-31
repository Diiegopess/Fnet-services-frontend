import React, { useState } from 'react';
import { useClients } from '../domains/clients/useClients';
import { ClientsTable } from '../domains/clients/components/ClientsTable';
import CreateClientModal from '../domains/clients/components/CreateClientModal';
import AssignTechniciansModal from '../domains/clients/components/AssignTechniiciansModal';
import Spinner from '../shared/components/Spinner';
import type { Client } from '../domains/clients/client.types';

export const ClientsPage: React.FC = () => {
  const {
    clients,
    loading,
    creating,
    assigning,
    actionLoadingId,
    error,
    isCreateModalOpen,
    setIsCreateModalOpen,
    addClient,
    refetch,
    toggleClientStatus,
    removeClient,
    assignTechnicians,
  } = useClients();

  const [selectedClientForTechs, setSelectedClientForTechs] = useState<Client | null>(null);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-sm text-gray-500">
            Listado y administración de organizaciones y técnicos asignados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            + Nuevo Cliente
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Refrescar
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {!loading && (
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <ClientsTable
            clients={clients}
            actionLoadingId={actionLoadingId}
            onToggleStatus={toggleClientStatus}
            onAssignTechnicians={(client) => setSelectedClientForTechs(client)}
            onDelete={(client) => {
              if (window.confirm(`¿Seguro que deseas eliminar al cliente "${client.name}"?`)) {
                removeClient(client.id);
              }
            }}
          />
        </div>
      )}

      {/* Modal de Registro de Cliente */}
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (payload) => {
          await addClient(payload);
        }}
        loading={creating}
      />

      {/* Modal de Asignación de Técnicos */}
      <AssignTechniciansModal
        isOpen={Boolean(selectedClientForTechs)}
        client={selectedClientForTechs}
        onClose={() => setSelectedClientForTechs(null)}
        onAssign={assignTechnicians}
        loading={assigning}
      />
    </div>
  );
};

export default ClientsPage;