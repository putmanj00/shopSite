'use client';

import { useState, useEffect } from 'react';
import type { CustomerAddress } from '@/app/api/customer/addresses/route';

interface AddressFormData {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
}

const emptyFormData: AddressFormData = {
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  province: '',
  country: 'United States',
  zip: '',
  phone: '',
};

interface AddressCardProps {
  address: CustomerAddress;
  isDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isLoading: boolean;
}

function AddressCard({ address, isDefault, onEdit, onDelete, onSetDefault, isLoading }: AddressCardProps) {
  return (
    <div className={`bg-white border rounded-lg p-4 ${isDefault ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'}`}>
      {isDefault && (
        <span className="inline-block text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded mb-2">
          Default Address
        </span>
      )}

      <p className="font-medium text-gray-900">
        {address.firstName} {address.lastName}
      </p>
      <p className="text-gray-600 text-sm mt-1">
        {address.address1}
        {address.address2 && <><br />{address.address2}</>}
      </p>
      <p className="text-gray-600 text-sm">
        {address.city}, {address.province} {address.zip}
      </p>
      <p className="text-gray-600 text-sm">{address.country}</p>
      {address.phone && (
        <p className="text-gray-600 text-sm mt-1">{address.phone}</p>
      )}

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={onEdit}
          disabled={isLoading}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
        >
          Edit
        </button>
        {!isDefault && (
          <button
            onClick={onSetDefault}
            disabled={isLoading}
            className="text-sm text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50"
          >
            Set as default
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

interface AddressFormProps {
  formData: AddressFormData;
  onChange: (data: AddressFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

function AddressForm({ formData, onChange, onSubmit, onCancel, isLoading, isEditing }: AddressFormProps) {
  const updateField = (field: keyof AddressFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Address' : 'Add New Address'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gold/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            required
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gold/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1 *
          </label>
          <input
            type="text"
            id="address1"
            required
            value={formData.address1}
            onChange={(e) => updateField('address1', e.target.value)}
            className="w-full px-3 py-2 border border-gold/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Street address"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 2
          </label>
          <input
            type="text"
            id="address2"
            value={formData.address2}
            onChange={(e) => updateField('address2', e.target.value)}
            className="w-full px-3 py-2 border border-gold/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="city"
            required
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            className="w-full px-3 py-2 border border-gold/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
            State / Province *
          </label>
          <input
            type="text"
            id="province"
            required
            value={formData.province}
            onChange={(e) => updateField('province', e.target.value)}
            className="w-full px-3 py-2 border border-gold/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP / Postal Code *
          </label>
          <input
            type="text"
            id="zip"
            required
            value={formData.zip}
            onChange={(e) => updateField('zip', e.target.value)}
            className="w-full px-3 py-2 border border-gold/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <input
            type="text"
            id="country"
            required
            value={formData.country}
            onChange={(e) => updateField('country', e.target.value)}
            className="w-full px-3 py-2 border border-gold/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gold/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="(optional)"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Address' : 'Add Address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AddressBook() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyFormData);

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      const response = await fetch('/api/customer/addresses');
      if (!response.ok) throw new Error('Failed to fetch addresses');
      const data = await response.json();
      setAddresses(data.addresses || []);
      setDefaultAddressId(data.defaultAddressId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddClick = () => {
    setFormData(emptyFormData);
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditClick = (address: CustomerAddress) => {
    setFormData({
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      province: address.province || '',
      country: address.country || 'United States',
      zip: address.zip || '',
      phone: address.phone || '',
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const action = editingAddress ? 'update' : 'create';
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          addressId: editingAddress?.id,
          address: formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save address');
      }

      await fetchAddresses();
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', addressId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete address');
      }

      await fetchAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setDefault', addressId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set default address');
      }

      setDefaultAddressId(addressId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default address');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {showForm ? (
        <AddressForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          isEditing={!!editingAddress}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
            </p>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
              <p className="text-gray-500 mb-4">Add an address for faster checkout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  isDefault={address.id === defaultAddressId}
                  onEdit={() => handleEditClick(address)}
                  onDelete={() => handleDelete(address.id)}
                  onSetDefault={() => handleSetDefault(address.id)}
                  isLoading={isSubmitting}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
