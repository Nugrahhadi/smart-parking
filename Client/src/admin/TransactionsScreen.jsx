import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Check,
  X,
  Calendar,
  Info,
  ExternalLink,
  Clock,
} from "lucide-react";
import {
  fetchTransactions,
  formatCurrency,
  formatDate,
  formatTime,
} from "../utils/api";

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions();
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // Function to render transaction status badge
  const renderStatusBadge = (status) => {
    let bgColor, textColor, icon;

    switch (status) {
      case "completed":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        icon = <Check size={14} className="mr-1" />;
        break;
      case "refunded":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        icon = <CreditCard size={14} className="mr-1" />;
        break;
      case "failed":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        icon = <X size={14} className="mr-1" />;
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
        icon = null;
    }

    return (
      <span
        className={`flex items-center px-2 py-1 rounded-full text-xs ${bgColor} ${textColor}`}
      >
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Calculate summary stats
  const totalTransactions = transactions.length;
  const totalRevenue = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const avgAmount =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const refundRate =
    totalTransactions > 0
      ? (
          (transactions.filter((t) => t.status === "refunded").length /
            totalTransactions) *
          100
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar would be here, but we'll reuse the one from AdminDashboard */}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <div className="bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold">Transactions</h2>
          <p className="text-gray-600">
            Manage and monitor all payment transactions
          </p>
        </div>

        {/* Transaction Summary Cards */}
        <div className="grid grid-cols-4 gap-4 p-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-gray-500 font-medium">Total Transactions</h3>
            <p className="text-2xl font-bold mt-2">{totalTransactions}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-gray-500 font-medium">Total Revenue</h3>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-gray-500 font-medium">Average Amount</h3>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(avgAmount)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-gray-500 font-medium">Refund Rate</h3>
            <p className="text-2xl font-bold mt-2">{refundRate}%</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 flex flex-wrap gap-3">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            />
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
          </div>

          <div className="flex space-x-2">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <div className="px-3 py-2 flex items-center">
                <Filter size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-700 text-sm">Status:</span>
              </div>
              <select className="border-l border-gray-300 px-3 py-2 outline-none">
                <option>All</option>
                <option>Completed</option>
                <option>Refunded</option>
                <option>Failed</option>
              </select>
            </div>

            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <div className="px-3 py-2 flex items-center">
                <Calendar size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-700 text-sm">Date Range:</span>
              </div>
              <select className="border-l border-gray-300 px-3 py-2 outline-none">
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Custom</option>
              </select>
            </div>
          </div>

          <div>
            <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center text-sm">
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">ID</th>
                  <th className="py-3 px-4 text-left font-medium">
                    Date & Time
                  </th>
                  <th className="py-3 px-4 text-left font-medium">User</th>
                  <th className="py-3 px-4 text-left font-medium">Location</th>
                  <th className="py-3 px-4 text-left font-medium">Duration</th>
                  <th className="py-3 px-4 text-left font-medium">Amount</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{transaction.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{formatDate(transaction.check_in_time)}</div>
                      <div className="text-sm text-gray-500">
                        {formatTime(transaction.check_in_time)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{transaction.user_name || "N/A"}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.user_email || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{transaction.location_name || "N/A"}</div>
                      <div className="text-sm text-gray-500">
                        Slot: {transaction.slot_number || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {transaction.duration || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4">
                      {renderStatusBadge(transaction.status)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="text-blue-600 text-sm flex items-center"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <Info size={16} className="mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing 1 to {transactions.length} of {transactions.length}{" "}
                entries
              </div>
              <div className="flex space-x-1">
                <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                  <ChevronLeft size={16} />
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md bg-blue-600 text-white">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details Modal (Would be shown when a transaction is clicked) */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Transaction Details</h3>
                <button
                  className="p-1 hover:bg-gray-100 rounded-full"
                  onClick={() => setSelectedTransaction(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-xl font-bold mr-2">
                        {selectedTransaction.id}
                      </h4>
                      {renderStatusBadge(selectedTransaction.status)}
                    </div>
                    <p className="text-gray-600 mt-1">
                      {formatDate(selectedTransaction.check_in_time)},{" "}
                      {formatTime(selectedTransaction.check_in_time)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Amount</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedTransaction.amount)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">Customer</p>
                    <p className="font-medium">
                      {selectedTransaction.user_name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedTransaction.user_email || "N/A"}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">Location</p>
                    <p className="font-medium">
                      {selectedTransaction.location_name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Slot: {selectedTransaction.slot_number || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-medium mb-2">Transaction Details</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Payment Method</p>
                      <p className="font-medium flex items-center">
                        <CreditCard size={16} className="mr-2 text-gray-500" />
                        {selectedTransaction.payment_method || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">Duration</p>
                      <p className="font-medium flex items-center">
                        <Clock size={16} className="mr-2 text-gray-500" />
                        {selectedTransaction.duration || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-md flex items-center justify-center">
                    <Download size={16} className="mr-2" />
                    Download Receipt
                  </button>

                  {selectedTransaction.status === "completed" ? (
                    <button className="flex-1 py-2 border border-red-600 text-red-600 rounded-md flex items-center justify-center">
                      <CreditCard size={16} className="mr-2" />
                      Process Refund
                    </button>
                  ) : null}

                  <button className="flex-1 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center">
                    <ExternalLink size={16} className="mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsScreen;
