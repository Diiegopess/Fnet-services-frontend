import React, { useState } from 'react';
import type { DeviceResponse } from '../device.types';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface DeleteDeviceModalProps {
  isOpen: boolean;
  device: DeviceResponse | null;
  onClose: () => void;
  onConfirm: (device: DeviceResponse) => Promise<void>;
  clients?: Array<{ id: string; name: string }>;
}

export const DeleteDeviceModal: React.FC<DeleteDeviceModalProps> = ({
  isOpen,
  device,
  onClose,
  onConfirm,
  clients = [],
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !device) return null;

  // Lógica de presentación de cliente respetando tus tipos
  const clientName = device.has_vdom_enabled
    ? 'Múltiples Clientes (Modo Multi-VDOM)'
    : clients.find((c) => c.id === device.client_id)?.name || 'Sin cliente asignado';

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(device);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-rose-50/50">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="p-2 bg-rose-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 leading-tight">Eliminar Firewall</h3>
              <p className="text-xs text-rose-600 font-medium">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen detallado del equipo */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Estás a punto de eliminar el siguiente firewall de la plataforma:
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Dispositivo:</span>
              <span className="font-bold text-gray-900">{device.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Host / IP:</span>
              <span className="font-mono text-gray-800">{device.host}:{device.port}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Cliente:</span>
              <span className="text-gray-800 font-medium">{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">FortiOS / Modo:</span>
              <span className="text-gray-800 font-mono">
                {device.fortios_version} ({device.has_vdom_enabled ? `Multi-VDOM [${device.vdoms?.length || 0}]` : 'Standalone'})
              </span>
            </div>
            {device.serial_number && (
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Número de Serie:</span>
                <span className="font-mono text-gray-700">{device.serial_number}</span>
              </div>
            )}
          </div>

          {device.has_vdom_enabled && device.vdoms && device.vdoms.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Atención:</strong> Este equipo posee <strong>{device.vdoms.length} VDOM(s)</strong> vinculados que también serán desvinculados del sistema.
              </span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 p-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
          >
            {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteDeviceModal;