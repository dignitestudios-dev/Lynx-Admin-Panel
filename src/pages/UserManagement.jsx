import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  Shield,
  ShieldOff,
  User,
  ShieldX,
  ShieldCheck,
  Ban,
} from "lucide-react";

import { formatDate, formatNumber } from "../utils/helpers";
import useGetAllUsers from "../hooks/users/useGetAllUsers";
import StatsCard from "../components/common/StatsCard";
import Card from "../components/ui/Card";
import DataTable from "../components/common/DataTable";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import useDebounce from "../hooks/global/useDebounce";

const UserManagement = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [actionUser, setActionUser] = useState(null);
const [actionStatus, setActionStatus] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ name: "", role: "", status: "" });
const [showDetailModal, setShowDetailModal] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
const [selectedUserId, setSelectedUserId] = useState(null);

// Correct hook call: filters, search, limit, page
const searchDebounce = useDebounce(filters.name );
const { users, loading, totalData, totalPages, getUserDetails, blockUser } =
useGetAllUsers(filters, searchDebounce, pageSize, currentPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Stats Cards
  const usersStats = useMemo(
    () => [
      {
        title: "Total Users",
        value: formatNumber(10290),
        icon: User,
        color: "text-primary-600",
        bgColor: "bg-primary-600/20",
      },
      {
        title: "Active Users",
        value: formatNumber(10111),
        icon: ShieldCheck,
        color: "text-green-600",
        bgColor: "bg-green-600/20",
      },
      {
        title: "Inactive Users",
        value: formatNumber(10290 - 10111 - 9),
        icon: ShieldX,
        color: "text-orange-600",
        bgColor: "bg-orange-600/20",
      },
      {
        title: "Blocked Users",
        value: formatNumber(9),
        icon: Ban,
        color: "text-red-600",
        bgColor: "bg-red-600/20",
      },
    ],
    []
  );



  // Table Columns
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <img
            src={user.pfp}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (_, user) => (
        <Badge
        variant={
          user.role === "admin"
          ? "danger"
          : user.role === "manager"
          ? "warning"
              : "default"
          }
          >
          {user.role || "N/A"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, user) => (
        <Badge
          variant={
            user.isActive ? "success" : "default"
          }
        >
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (_, user) => formatDate(user.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button
  variant="ghost"
  size="sm"
  onClick={async () => {
    setSelectedUserId(user._id);  // trigger fetch
    const details = await getUserDetails(user._id);
    setSelectedUser(details);
    setShowDetailModal(true);     // open modal after data fetch
  }}
  icon={<Eye className="w-4 h-4" />}
  title="View Details"
/>

<Button
  variant="ghost"
  size="sm"
  onClick={() => {
    setActionUser(user);
    // If user is active, next action is to block → pass false
    // If user is inactive, next action is to unblock → pass true
    setActionStatus(!user.isActive); 
    setShowConfirmModal(true);
  }}
  icon={user.isActive ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
  title={user.isActive ? "Block User" : "Unblock User"}
/>


        </div>
      ),
    },
  ];
  
  console.log(selectedUser,"actionStatus");

  return (
    <div className="space-y-6">
      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {usersStats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} colored />
        ))}
      </div> */}
      {/* Filters */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, name: e.target.value }))
          }
          className="border rounded px-3 py-2 w-full md:w-64"
        />

        <Button
          onClick={() => setFilters({ name: "", role: "", status: "" })}
          variant="outline"
        >
          Clear Filters
        </Button>
      </Card>
      {/* Data Table */}
      <DataTable
        title="User Management"
        data={users}
        loading={loading}
        columns={columns}
        totalData={totalData}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="User Details"
        size="xl"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <img
                src={selectedUser.pfp}
                alt={selectedUser.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedUser.email}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {" "}
                  {selectedUser.gender}, {formatDate(selectedUser.dob)}{" "}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge
                    variant={
                      selectedUser.isBlocked
                        ? "danger"
                        : selectedUser.isActive
                        ? "success"
                        : "default"
                    }
                  >
                    {selectedUser.isBlocked
                      ? "Blocked"
                      : selectedUser.isActive
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                  <Badge
                    variant={
                      selectedUser.role === "admin"
                        ? "danger"
                        : selectedUser.role === "manager"
                        ? "warning"
                        : "default"
                    }
                  >
                    {selectedUser.role}
                  </Badge>
                  {selectedUser.isSocialLogin && (
                    <Badge variant="info">{selectedUser.socialProvider}</Badge>
                  )}
                </div>
              </div>
            </div>
            {/* About */}
            {selectedUser.about && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  About
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedUser.about}
                </p>
              </div>
            )}
            {/* Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Contact
                </h4>
                <p>
                  <strong>Phone:</strong> {selectedUser.phone || "Not provided"}
                </p>
                <p>
                  <strong>Email Verified:</strong>{" "}
                  {selectedUser.emailVerified ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedUser.address || "Not provided"}
                </p>
              </div>
              {/* Account */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Account
                </h4>
                <p>
                  <strong>Member Since:</strong>{" "}
                  {formatDate(selectedUser.createdAt)}
                </p>
                <p>
                  <strong>Onboarded:</strong>{" "}
                  {selectedUser.isOnboarded ? "Yes" : "No"}
                </p>
              </div>
              {/* Interests */}
              {selectedUser.interests && (
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser?.interests?.length > 0 ? (  selectedUser.interests.map((i, idx) => (
                      <Badge key={idx} variant="secondary">
                        {i}
                      </Badge>
                    ))) : (<span className="text-gray-500">Not provided</span>)}
                  
                  </div>
                </div>
              )}
              {/* Skills */}
              {selectedUser.skills && (
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Skills
                  </h4>
                <div className="flex flex-wrap gap-2">
  {selectedUser?.skills?.length > 0 ? (
    selectedUser.skills.map((s, idx) => (
      <Badge key={idx}>{s}</Badge>
    ))
  ) : (
    <span className="text-gray-500">Not provided</span>
  )}
</div>

                </div>
              )}
              {/* University */}
              {selectedUser.university && (
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg col-span-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    University
                  </h4>
                  <p>
                    <strong>Name:</strong> {selectedUser.university.name}
                  </p>
                  <p>
                    <strong>Major:</strong> {selectedUser.university.major}
                  </p>
                  <p>
                    <strong>Graduation Year:</strong>{" "}
                    {selectedUser.university.graduationYear}
                  </p>
                </div>
              )}
              {/* QR Code */}
              {/* {selectedUser.qrCode && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg col-span-2 flex justify-center">
                  <img
                    src={selectedUser.qrCode}
                    alt="QR Code"
                    className="w-40 h-40"
                  />
                </div>
              )} */}
            </div>
          </div>
        )}
      </Modal>
<Modal
  isOpen={showConfirmModal}
  onClose={() => setShowConfirmModal(false)}
  title="Confirm Action"
  size="sm"
>
  {actionUser && (
    <div className="space-y-4">
      <p className="text-gray-700 dark:text-gray-300">
        Are you sure you want to{" "}
        <strong>{actionStatus === false ? "block" : "unblock"}</strong>{" "}
        <span className="font-semibold">{actionUser.name}</span>?
      </p>

      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={() => setShowConfirmModal(false)}
        >
          Cancel
        </Button>

        <Button
          variant={actionStatus === false ? "danger" : "success"}
          onClick={async () => {
            await blockUser(actionUser._id, actionStatus); // pass boolean
            setShowConfirmModal(false);
            // Refresh list after block/unblock
            getAllUsers(); 
          }}
        >
          {actionStatus === false ? "Block User" : "Unblock User"}
        </Button>
      </div>
    </div>
  )}
</Modal>



    </div>
  );
};

export default UserManagement;
