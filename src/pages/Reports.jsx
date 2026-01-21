import { useState } from "react";
import { Eye, Ban } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { formatDate, formatDateTime } from "../utils/helpers";
import FilterBar from "../components/ui/FilterBar";
import useGetAllReports from "../hooks/report/useGetAllReports";

const Reports = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ name: "" });

  const {
    reports,
    loading,
    totalData,
    totalPages,
    selectedReport,
    getReportDetails,
    restrictUser,
    setReports,
  } = useGetAllReports(pageSize, currentPage);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [restrictUserData, setRestrictUserData] = useState(null);
  const [restrictForm, setRestrictForm] = useState({
    weeks: "1",
    reason: "",
  });
  console.log(reports);
  // const [filters, setFilters] = useState({
  //   status: "",
  //   type: "",
  //   priority: "",
  // });

  const handleView = async (report) => {
    await getReportDetails(report._id);
    setShowDetailModal(true);
  };

  const handleRestrictClick = (report) => {
    setRestrictUserData(report.reportedUser);
    setRestrictForm({
      weeks: "1",
      reason: "",
    });
    setShowRestrictModal(true);
  };

  const handleRestrictSubmit = async () => {
    try {
      const updatedUser = await restrictUser(
        restrictUserData._id,
        restrictForm,
      );

      // Update local state so button disables immediately
      setReports((prev) =>
        prev.map((r) =>
          r.reportedUser._id === restrictUserData._id
            ? { ...r, reportedUser: { ...r.reportedUser, ...updatedUser } }
            : r,
        ),
      );

      setShowRestrictModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filters.status && report.status !== filters.status) return false;
    if (filters.type && report.type !== filters.type) return false;
    if (filters.priority && report.priority !== filters.priority) return false;
    return true;
  });

  const columns = [
    {
      key: "reporter",
      label: "Reporter",
      render: (_, report) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
            <img
              src={report.reporter.pfp}
              alt=""
              className="w-8 h-8 rounded-full"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {report.reporter.name}
            </p>
            <p className="text-sm text-gray-500">{report.reporter.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "reportedUser",
      label: "Reported User",
      render: (_, report) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100">
            <img
              src={report?.reportedUser?.pfp}
              alt=""
              className="w-8 h-8 rounded-full"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {report?.reportedUser?.name}
            </p>
            <p className="text-sm text-gray-500">
              {report?.reportedUser?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => <Badge variant="default">{value}</Badge>,
    },
    {
      key: "createdAt",
      label: "Reported",
      render: (value) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, report) => {
        const isRestricted = report?.reportedUser?.isRestricted;

        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(report)}
              icon={<Eye className="w-4 h-4" />}
              title="View Details"
            />
            <Button
              variant="danger"
              size="sm"
              disabled={isRestricted}
              onClick={() => handleRestrictClick(report)}
              icon={<Ban className="w-4 h-4" />}
              title={isRestricted ? "User already restricted" : "Restrict user"}
            >
              {isRestricted ? "Restricted" : "Restrict"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* <Card className="p-4">
        <FilterBar
          filters={[
            {
              key: "status",
              label: "Status",
              type: "select",
              value: filters.status,
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, status: value })),
              options: [
                { value: "pending", label: "Pending" },
                { value: "investigating", label: "Investigating" },
                { value: "resolved", label: "Resolved" },
                { value: "dismissed", label: "Dismissed" },
              ],
            },
            {
              key: "type",
              label: "Type",
              type: "select",
              value: filters.type,
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, type: value })),
              options: [
                { value: "chat", label: "Chat" },
                { value: "service", label: "Service" },
                { value: "other", label: "Other" },
              ],
            },
          ]}
          onClear={() => setFilters({ status: "", type: "", priority: "" })}
        />
      </Card> */}

      <DataTable
        title="User Reports"
        data={filteredReports}
        columns={columns}
        addButton={false}
        loading={loading}
        totalData={totalData}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage} // total number of records
        onPageSizeChange={setPageSize} // function to handle page change
      />

      {selectedReport && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Report Details"
          size="xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Reporter
                </h4>
                <div className="flex items-center space-x-3 mt-2">
                  <img
                    src={selectedReport.reporter.pfp}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p>{selectedReport.reporter.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedReport.reporter.email}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Reported User
                </h4>
                <div className="flex items-center space-x-3 mt-2">
                  <img
                    src={selectedReport?.reportedUser?.pfp}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p>{selectedReport?.reportedUser?.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedReport?.reportedUser?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {selectedReport.type === "event" && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Event Details
                </h2>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    Title
                  </h2>
                  <p> {selectedReport?.event.title}</p>
                </div>
                <div>
                  {" "}
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    Reason
                  </h2>
                  <p>{selectedReport?.reason}</p>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Report Status
              </h4>

              <p>Type: {selectedReport?.type}</p>
              <p>Updated At: {formatDate(selectedReport?.updatedAt)}</p>
              <p>
                Restricted Until:{" "}
                {formatDateTime(selectedReport?.reportedUser?.restrictedUntil)}
              </p>
              <p>Reason: {selectedReport?.reportedUser?.restrictedReason}</p>
              <p></p>
            </div>
          </div>
        </Modal>
      )}
      {/* Restrict Modal */}
      <Modal
        isOpen={showRestrictModal}
        onClose={() => setShowRestrictModal(false)}
        title="Restrict User"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <img
              src={restrictUserData?.pfp}
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{restrictUserData?.name}</p>
              <p className="text-sm text-gray-500">{restrictUserData?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Restrict Duration (Weeks)
            </label>
            <input
              type="text"
              min={1}
              max={52}
              value={restrictForm.weeks}
              onChange={(e) => {
                const val = e.target.value;
                // allow only digits and empty string
                if (/^\d*$/.test(val)) {
                  setRestrictForm((prev) => ({
                    ...prev,
                    weeks: val === "" ? "" : Number(val), // convert to number
                  }));
                }
              }}
              className={`w-full border rounded-md p-2 ${
                restrictForm.weeks < 1 || restrictForm.weeks > 52
                  ? "border-red-500"
                  : ""
              }`}
            />
            {(restrictForm.weeks < 1 ||
              restrictForm.weeks > 52 ||
              restrictForm.weeks === "") && (
              <p className="text-xs text-red-500 mt-1">
                Value must be between 1 and 52
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              rows={3}
              className="w-full border rounded-md p-2"
              placeholder="Enter restriction reason"
              value={restrictForm.reason}
              onChange={(e) =>
                setRestrictForm((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowRestrictModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRestrictSubmit}>
              Confirm Restrict
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;
