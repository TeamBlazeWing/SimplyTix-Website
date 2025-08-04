import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { isTokenValid, clearAuthData } from '../../utils/auth';

const CreateEventForm = ({ isOpen, onClose, onEventCreated, editingEvent=null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'conference',
    date: '',
    time: '',
    location: '',
    imageUrl: '',
    district: '',
    maxAttendees: 100,
    tags: '',
    tickets: [{ name: 'General Admission', price: 0, quantity: 100 }],
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const eventTypes = [
    'workshop',
    'seminar',
    'conference',
    'meetup',
    'volunteer',
    'music',
    'art',
    'sports',
    'business',
    'other',
  ];

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        type: editingEvent.type || 'conference',
        date: editingEvent.date
          ? new Date(editingEvent.date).toISOString().slice(0, 10)
          : '',
        time: editingEvent.time || '',
        location: editingEvent.location || '',
        imageUrl: editingEvent.imageUrl || '',
        district: editingEvent.district || '',
        maxAttendees: editingEvent.maxAttendees || 100,
        tags: Array.isArray(editingEvent.tags)
          ? editingEvent.tags.join(', ')
          : editingEvent.tags || '',
        tickets:
          Array.isArray(editingEvent.tickets) && editingEvent.tickets.length > 0
            ? editingEvent.tickets.map((ticket) => ({
                name: ticket.name || '',
                price: ticket.price || 0,
                quantity: ticket.totalQuantity || ticket.quantity || 100,
              }))
            : [{ name: 'General Admission', price: 0, quantity: 100 }],
      });
      setSelectedImage(null);
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'conference',
        date: '',
        time: '',
        location: '',
        imageUrl: '',
        district: '',
        maxAttendees: 100,
        tags: '',
        tickets: [{ name: 'General Admission', price: 0, quantity: 100 }],
      });
      setSelectedImage(null);
    }
    setFormErrors({});
  }, [editingEvent]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim())
      errors.description = 'Description is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (formData.maxAttendees < 1)
      errors.maxAttendees = 'Maximum attendees must be at least 1';
    if (formData.tickets.length === 0) {
      errors.tickets = 'At least one ticket type is required';
    } else {
      formData.tickets.forEach((ticket, index) => {
        if (!ticket.name.trim())
          errors[`ticketName${index}`] = 'Ticket name is required';
        if (ticket.price < 0)
          errors[`ticketPrice${index}`] = 'Price cannot be negative';
        if (ticket.quantity < 1)
          errors[`ticketQuantity${index}`] = 'Quantity must be at least 1';
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTicketChange = (index, field, value) => {
    const updatedTickets = [...formData.tickets];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    setFormData((prev) => ({ ...prev, tickets: updatedTickets }));
    setFormErrors((prev) => ({ ...prev, [`ticket${field}${index}`]: '' }));
  };

  const addTicket = () => {
    setFormData((prev) => ({
      ...prev,
      tickets: [
        ...prev.tickets,
        { name: '', price: 0, quantity: 100 },
      ],
    }));
  };

  const removeTicket = (index) => {
    if (formData.tickets.length <= 1) {
      alert('At least one ticket type is required');
      return;
    }
    const updatedTickets = formData.tickets.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, tickets: updatedTickets }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    setUploadingImage(true);
    setSelectedImage(file);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token || !isTokenValid(token)) {
        alert('Your session has expired. Please log in again.');
        clearAuthData();
        navigate('/login', {
          state: { message: 'Your session has expired. Please log in again.' },
        });
        return;
      }

      const formDataForUpload = new FormData();
      formDataForUpload.append('image', file);

      const response = await fetch('http://localhost:3000/api/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataForUpload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Image upload failed');
      }

      const data = await response.json();
      console.log('Image uploaded successfully:', data);
      const imagelink = data.data.secure_url || data.data.url;
      console.log('Image URL:', imagelink);

      setFormData((prev) => ({
        ...prev,
        imageUrl: imagelink,
      }));
      alert('✅ Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(`❌ Image upload failed: ${error.message}`);
      setSelectedImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token || !isTokenValid(token)) {
        alert('Your session has expired. Please log in again.');
        clearAuthData();
        navigate('/login', {
          state: { message: 'Your session has expired. Please log in again.' },
        });
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        date: formData.date,
        time: formData.time || undefined,
        location: formData.location,
        imageUrl: formData.imageUrl || undefined,
        district: formData.district || undefined,
        maxAttendees: parseInt(formData.maxAttendees, 10),
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
        tickets: formData.tickets.map((ticket) => ({
          name: ticket.name,
          price: parseFloat(ticket.price),
          totalQuantity: parseInt(ticket.quantity, 10),
        })),
      };

      const url = editingEvent
        ? `http://localhost:3000/api/events/${editingEvent._id || editingEvent.id}`
        : 'http://localhost:3000/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Session expired. Please log in again.');
          clearAuthData();
          navigate('/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to ${editingEvent ? 'update' : 'create'} event`
        );
      }

      const data = await response.json();
      alert(
        `✅ Event ${editingEvent ? 'updated' : 'created'} successfully!`
      );
      onEventCreated();
      onClose();
    } catch (error) {
      console.error(
        `Failed to ${editingEvent ? 'update' : 'create'} event:`,
        error
      );
      alert(
        `❌ Failed to ${editingEvent ? 'update' : 'create'} event: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border border-white/10 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-red-600/80 hover:bg-red-700 rounded-full transition-all"
        >
          <FaTimes className="text-white" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border ${
                  formErrors.title ? 'border-red-500' : 'border-gray-600'
                } bg-gray-800 text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Event Title"
              />
              {formErrors.title && (
                <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border ${
                  formErrors.description ? 'border-red-500' : 'border-gray-600'
                } bg-gray-800 text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500`}
                rows="4"
                placeholder="Event Description"
              />
              {formErrors.description && (
                <p className="text-red-400 text-xs mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Event Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-lg border ${
                    formErrors.date ? 'border-red-500' : 'border-gray-600'
                  } bg-gray-800 text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.date && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.date}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-lg border ${
                    formErrors.location ? 'border-red-500' : 'border-gray-600'
                  } bg-gray-800 text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Event Location"
                />
                {formErrors.location && (
                  <p className="text-red-400 text-xs mt-1">
                    {formErrors.location}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Event District"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Maximum Attendees *
              </label>
              <input
                type="number"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                min="1"
                className={`mt-1 block w-full rounded-lg border ${
                  formErrors.maxAttendees ? 'border-red-500' : 'border-gray-600'
                } bg-gray-800 text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              {formErrors.maxAttendees && (
                <p className="text-red-400 text-xs mt-1">
                  {formErrors.maxAttendees}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., networking, tech, free"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Event Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                >
                  {uploadingImage ? 'Uploading...' : 'Choose Image'}
                </label>
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                )}
                {selectedImage && !uploadingImage && (
                  <span className="text-gray-300">
                    {selectedImage.name}
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Ticket Types *
                </label>
                <button
                  type="button"
                  onClick={addTicket}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <FaPlus /> Add Ticket
                </button>
              </div>
              {formData.tickets.map((ticket, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-white font-medium">
                      Ticket Type {index + 1}
                    </h4>
                    {formData.tickets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicket(index)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-300">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) =>
                          handleTicketChange(index, 'name', e.target.value)
                        }
                        className={`mt-1 block w-full rounded-lg border ${
                          formErrors[`ticketName${index}`]
                            ? 'border-red-500'
                            : 'border-gray-600'
                        } bg-gray-800 text-white px-3 py-1 text-sm`}
                        placeholder="Ticket Name"
                      />
                      {formErrors[`ticketName${index}`] && (
                        <p className="text-red-400 text-xs mt-1">
                          {formErrors[`ticketName${index}`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300">
                        Price *
                      </label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) =>
                          handleTicketChange(index, 'price', e.target.value)
                        }
                        min="0"
                        step="0.01"
                        className={`mt-1 block w-full rounded-lg border ${
                          formErrors[`ticketPrice${index}`]
                            ? 'border-red-500'
                            : 'border-gray-600'
                        } bg-gray-800 text-white px-3 py-1 text-sm`}
                      />
                      {formErrors[`ticketPrice${index}`] && (
                        <p className="text-red-400 text-xs mt-1">
                          {formErrors[`ticketPrice${index}`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) =>
                          handleTicketChange(index, 'quantity', e.target.value)
                        }
                        min="1"
                        className={`mt-1 block w-full rounded-lg border ${
                          formErrors[`ticketQuantity${index}`]
                            ? 'border-red-500'
                            : 'border-gray-600'
                        } bg-gray-800 text-white px-3 py-1 text-sm`}
                      />
                      {formErrors[`ticketQuantity${index}`] && (
                        <p className="text-red-400 text-xs mt-1">
                          {formErrors[`ticketQuantity${index}`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {formErrors.tickets && (
                <p className="text-red-400 text-xs mt-1">{formErrors.tickets}</p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 ${
                  loading || uploadingImage
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingEvent ? 'Updating...' : 'Creating...'}
                  </>
                ) : editingEvent ? (
                  'Update Event'
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventForm;