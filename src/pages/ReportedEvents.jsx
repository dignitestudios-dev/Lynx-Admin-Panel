import { CheckCircle, Edit, Eye, Image, XCircle } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Modal from "../components/ui/Modal";
import { useState } from "react";
import useGetAllUsers from "../hooks/users/useGetAllUsers";
import Badge from "../components/ui/Badge";
import { formatDate } from "../utils/helpers";
import Button from "../components/ui/Button";


export default function ReportedEvents() {
 const [searchTerm, setSearchTerm] = useState("");
        const [currentPage, setCurrentPage] = useState(1);
      const [showDetailModal, setShowDetailModal] = useState(false);
       const [selectedUser, setSelectedUser] = useState(null);
        const [pageSize, setPageSize] = useState(10);
     const { totalData, totalPages, users, loading, getAllUsers } = useGetAllUsers(
       
          currentPage,
          pageSize
        );
         const handleView = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };


               const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Name",

      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100/30 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge
          variant={
            value === "admin"
              ? "danger"
              : value === "manager"
              ? "warning"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <Badge
            variant={
              user.isBlocked
                ? "danger"
                : value === "active"
                ? "success"
                : "default"
            }
          >
            {user.isBlocked ? "Blocked" : value}
          </Badge>
        </div>
      ),
    },
    {
      key: "totalTransactions",
      label: "Transactions",

      render: (value, user) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">${user.totalSpent.toFixed(2)}</p>
        </div>
      ),
    },
    {
      key: "lastLogin",
      label: "Last Login",

      render: (value) => (
        <div>
          <p className="text-sm">{formatDate(value)}</p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",

      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(user)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
     
      
         
        </div>
      ),
    },
  ]
    return (
        <div>
            <div>
            <DataTable
              title="Reported Events"
              data={users}
              loading={loading}
             
              columns={columns}
              totalData={totalData}
              totalPages={totalPages}
              currentPage={currentPage}
              pageSize={pageSize}
              searchTerm={searchTerm}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              onSearch={setSearchTerm}
            
            />
<Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        size="lg"
      >
        {selectedUser && (
          <div>
            <div className=" p-6 rounded-t-lg relative">
              <h2 className="text-2xl font-bold text-black">Event Details</h2>
              <p className="text-black mt-1">Complete event information</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    title
                  </h3>
                  <p className="text-gray-600">
                    This is a detailed description of the event. It includes all
                    the information about what will happen, when, and who is
                    organizing it.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold">date</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold">category</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Creator</p>
                    <p className="font-semibold">creator</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Event Images</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
        </div>
        </div>
    );
}