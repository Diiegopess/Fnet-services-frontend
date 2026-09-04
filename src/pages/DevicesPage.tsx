import React, { useState } from 'react';
import { useDevices } from '../domains/devices/useDevices';
import { useClients } from '../domains/clients/useClients';
import DevicesTable from '../domains/devices/components/DevicesTable';
import CreateDeviceModal from '../domains/devices/components/CreateDeviceModal';
import { Shield, Plus } from 'lucide-react';
import type { DeviceResponse } from '../domains/devices/device.types';

export const DevicesPage: React.FC = () => {
  const {
    devices,
    supportedVersions,
    isLoading,
    error,
    isTesting,
    createDevice,
    deleteDevice,
    testConnection,
  } = useDevices();

  const { clients } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleDelete = async (device: DeviceResponse) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el firewall ${device.name}?`)) return;
    setActionLoadingId(device.id);
    try {
      await deleteDevice(device.id);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Infraestructura FortiGate
          </h1>
          <p className="text-sm text-gray-500">
            Administración centralizada de firewalls físicos, virtuales y particiones VDOM
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Firewall
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {isLoading && devices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Cargando dispositivos...</div>
        ) : (
          <DevicesTable
            devices={devices}
            clients={clients} 
            actionLoadingId={actionLoadingId}
            onDelete={handleDelete}
          />
        )}
      </div>

      <CreateDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await createDevice(data);
        }}
        onTestConnection={testConnection}
        clients={clients}
        supportedVersions={supportedVersions}
        testingConnection={isTesting}
      />
    </div>
  );
};

export default DevicesPage;