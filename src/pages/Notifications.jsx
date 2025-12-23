import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import { useForm } from "react-hook-form";
import useNotifications from "../hooks/notification/useNotifications";
import Badge from "../components/ui/Badge"; // Assuming you have a Badge component

const Notifications = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  const {
    notifications,
    loading,
    totalData,
    totalPages,
    getNotifications,
    createNotification,
    deleteNotification,
  } = useNotifications(page, limit);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Table columns
  const columns = [
    {
      key: "title",
      label: "Title",
      render: (value, notification) => (
        <div>
          <p className="font-medium text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">{notification.description}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value, notification) => (
        <p className="text-sm text-gray-700">{notification.scheduled ? "Scheduled" : "Instant"}</p>
      ),
    },
    {
      key: "when",
      label: "Scheduled At",
      render: (value, notification) => (
        <p className="text-sm text-gray-700">
          {notification.scheduleAt
            ? new Date(notification.scheduleAt).toLocaleString()
            : notification.sentAt
            ? new Date(notification.sentAt).toLocaleString()
            : "-"}
        </p>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, notification) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(notification)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(notification)}
            icon={<Trash2 className="w-4 h-4" />}
            title="Delete"
          /> */}
        </div>
      ),
    },
  ];

  // Handlers
  const handleCreate = () => {
    reset();
    setShowCreateModal(true);
  };

  const handleView = (notification) => {
    setCurrentNotification(notification); // Use table data
    setShowDetailModal(true);
  };

  const handleDelete = async (notification) => {
    if (confirm(`Delete notification "${notification.title}"?`)) {
      await deleteNotification(notification._id);
      getNotifications(page, limit);
    }
  };

  const onSubmit = async (data) => {
    const newNotification = {
      title: data.title,
      description: data.description,
      type: data.type,
      when: data.when ? new Date(data.when).toISOString() : new Date().toISOString(),
    };
    await createNotification(newNotification);
    getNotifications(page, limit);
    setShowCreateModal(false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    getNotifications(newPage, limit);
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    getNotifications(1, newLimit);
  };

  return (
    <div className="space-y-6">
      {/* Create Notification Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <h2 className="text-xl font-semibold mb-4">Create Notification</h2>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Title"
            {...register("title", { required: true })}
            placeholder="Enter notification title"
            error={errors.title && "Title is required"}
          />
          <TextArea
            label="Description"
            {...register("description", { required: true })}
            placeholder="Enter notification description"
            error={errors.description && "Description is required"}
          />
          <Select
            label="Type"
            {...register("type", { required: true })}
            options={[
              { label: "Instant", value: "instant" },
              { label: "Schedule", value: "schedule" },
            ]}
            error={errors.type && "Type is required"}
          />
          <Input
            type="datetime-local"
            label="When"
            {...register("when")}
            placeholder="Select date and time"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      {/* Notifications Table */}
      <DataTable
        title="Push Notifications"
        data={notifications}
        columns={columns}
        onAdd={handleCreate}
        loading={loading}
   
      
      
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSize={limit}
        currentPage={page}
        totalPages={totalPages}
        totalData={totalData}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Notification Details"
        size="xl"
      >
        {currentNotification && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentNotification.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{currentNotification.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={currentNotification.scheduled ? "info" : currentNotification.sentAt ? "success" : "warning"}>
                    {currentNotification.scheduled ? "Scheduled" : currentNotification.sentAt ? "Sent" : "Draft"}
                  </Badge>
                  {currentNotification.sentAt && (
                    <Badge variant="purple">
                      Sent At: {new Date(currentNotification.sentAt).toLocaleString()}
                    </Badge>
                  )}
                  {currentNotification.scheduleAt && (
                    <Badge variant="blue">
                      Scheduled At: {new Date(currentNotification.scheduleAt).toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">Basic Information</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Title</label>
                    <p className="text-gray-900 dark:text-white">{currentNotification.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 dark:text-white">{currentNotification.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-gray-900 dark:text-white">{currentNotification.scheduled ? "Scheduled" : "Instant"}</p>
                  </div>
                </div>
              </div>

              {/* Timing Info */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">Timing</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scheduled At</label>
                    <p className="text-gray-900 dark:text-white">
                      {currentNotification.scheduleAt
                        ? new Date(currentNotification.scheduleAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" onClick={() => setShowDetailModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;
