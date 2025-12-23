import React, { useState } from "react";
import FilterBar from "../components/ui/FilterBar";
import Card from "../components/ui/Card";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { Eye, CheckCircle, XCircle, Edit } from "lucide-react";
import useGetAllEvents from "../hooks/event/useGetAllEvent";
import { formatDate } from "../utils/helpers";

const EventsManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { events, totalData, totalPages, loading, getEventDetails } =
    useGetAllEvents(pageSize, currentPage);

  const handleView = async (eventId) => {
    const eventData = await getEventDetails(eventId);
    setSelectedEvent(eventData);
    setShowDetailModal(true);
  };
console.log(getEventDetails)
  const columns = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "dates",
      label: "Date",
      render: (dates) =>
        dates?.start ? formatDate(dates.start) : "-",
    },
    {
      key: "ticketPrice",
      label: "Ticket Price",
      render: (value) => `$${value}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "complete"
              ? "success"
              : value === "pending"
              ? "warning"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, event) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(event._id)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Events Management"
        data={events}
        columns={columns}
        loading={loading}
        totalData={totalData}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Event Details Modal */}
  {selectedEvent && (
  <Modal
    isOpen={showDetailModal}
    onClose={() => setShowDetailModal(false)}
    title="Event Details"
    size="lg"
  >
    <div className="space-y-6">
      {/* Event Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedEvent.title}
        </h2>
        <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
      </div>

      {/* Event Info Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p className="font-semibold text-gray-800 dark:text-white">{selectedEvent.category}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-semibold text-gray-800 dark:text-white">{selectedEvent.location}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {selectedEvent.dates
              ? `${formatDate(selectedEvent.dates.start)} - ${formatDate(selectedEvent.dates.end)}`
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Time</p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {selectedEvent.times
              ? `${selectedEvent.times.start} - ${selectedEvent.times.end}`
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Ticket Price</p>
          <p className="font-semibold text-gray-800 dark:text-white">${selectedEvent.ticketPrice}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tickets</p>
          <p className="font-semibold text-gray-800 dark:text-white">{selectedEvent.ticketQuantity}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <Badge
            variant={
              selectedEvent.status === "complete"
                ? "success"
                : selectedEvent.status === "pending"
                ? "warning"
                : "default"
            }
          >
            {selectedEvent.status}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-500">Attendees</p>
          <p className="font-semibold text-gray-800 dark:text-white">{selectedEvent.attendeeCount}</p>
        </div>
      </div>

      {/* Host Info */}
      {selectedEvent.host && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Host Info</h3>
          <div className="flex items-center space-x-4">
            <img
              src={selectedEvent.host.pfp}
              alt={selectedEvent.host.name}
              className="w-12 h-12 rounded-full border"
            />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{selectedEvent.host.name}</p>
              <p className="text-sm text-gray-500">{selectedEvent.host.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Event Media */}
      {selectedEvent.media && selectedEvent.media.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Event Images</h3>
          <div className="grid grid-cols-3 gap-3">
            {selectedEvent.media.map((img, idx) => (
              <div
                key={idx}
                className="h-32 w-full bg-gray-200 rounded-lg overflow-hidden shadow-sm flex items-center justify-center"
              >
                <img src={img} alt={`event-${idx}`} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RSVP Info */}
      
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Venue Info</h3>
          <p className="text-gray-800 dark:text-white">{selectedEvent.venue}</p>
        </div>
     

      {/* Action Buttons */}
      {/* <div className="flex gap-3 pt-4 border-t">
        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition">
          <CheckCircle className="w-5 h-5" /> Approve
        </button>
        <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition">
          <XCircle className="w-5 h-5" /> Reject
        </button>
        <button
          className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition"
          onClick={() => setShowDetailModal(false)}
        >
          <Edit className="w-5 h-5" /> Close
        </button>
      </div> */}
    </div>
  </Modal>
)}


     
    </div>
  );
};

export default EventsManagement;
