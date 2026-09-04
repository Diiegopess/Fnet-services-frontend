import React, { useState } from 'react';
import type { DeviceResponse, DeviceUpdateRequest } from '../device.types';
import { X, Shield } from 'lucide-react';

interface EditDeviceModalProps {
  isOpen: boolean;
  device: DeviceResponse | null;
  onClose: () => void;
  onSubmit: (id: string, payload: DeviceUpdateRequest) => Promise<void>;
  clients?: Array<{ id: string; name: string }>;
}

export const EditDeviceModal: React.FC<EditDeviceModalProps> = ({
  isOpen,
  device,
  onClose,
  onSubmit,
  clients = [],
}) => {
  if (!isOpen || !device) return null;

  const [name, setName] = useState(device.name);
  const [host, setHost] = useState(device.host);
  const [port, setPort] = useState(device.port);
  const [fortiosVersion, setFortiosVersion] = useState(device.fortios_version);
  const [apiToken, setApiToken] = useState(''); // Se deja vacío por seguridad
  const [clientId, setClientId] = useState(device.client_id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: DeviceUpdateRequest = {
        name,
        host,
        port,
        fortios_version: fortiosVersion,
        client_id: clientId || null,
      };
      // Solo enviamos el token si el administrador ingresó uno nuevo
      if (apiToken.trim()) {
        payload.api_token = apiToken.trim();
      }
      await onSubmit(device.id, payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Editar Firewall: {device.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm border-gray-300"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Host / IP</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Puerto</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 text-sm border-gray-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              API Token (Dejar vacío para no cambiar)
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Cliente Asignado</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm border-gray-300"
            >
              <option value="">Sin cliente / Multicliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};