"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import { useTimers } from "../hooks/useTimers";
import { useToastContext } from "../context/ToastContext";
import { Timer, CreateTimerData } from "../hooks/useTimers";

interface TimerManagementProps {
  className?: string;
}

export default function TimerManagement({
  className = "",
}: TimerManagementProps) {
  const {
    timers,
    loading,
    error,
    fetchTimers,
    createTimer,
    updateTimer,
    deleteTimer,
    toggleTimerStatus,
  } = useTimers();

  const { showSuccess, showError, showInfo } = useToastContext();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTimer, setEditingTimer] = useState<Timer | null>(null);
  const [formData, setFormData] = useState<CreateTimerData>({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    type: "GENERAL",
  });

  useEffect(() => {
    fetchTimers();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (editingTimer) {
          await updateTimer({ id: editingTimer._id, ...formData });
          showSuccess("Timer Updated", "Timer has been updated successfully");
          setEditingTimer(null);
        } else {
          await createTimer(formData);
          showSuccess(
            "Timer Created",
            "New timer has been created successfully"
          );
        }
        setFormData({
          name: "",
          description: "",
          startTime: "",
          endTime: "",
          type: "GENERAL",
        });
        setShowCreateForm(false);
      } catch (error) {
        console.error("Error saving timer:", error);
        showError("Timer Save Failed", "Failed to save timer");
      }
    },
    [editingTimer, formData, updateTimer, createTimer, showSuccess, showError]
  );

  const handleEdit = useCallback((timer: Timer) => {
    setEditingTimer(timer);
    setFormData({
      name: timer.name,
      description: timer.description || "",
      startTime: new Date(timer.startTime).toISOString().slice(0, 16),
      endTime: new Date(timer.endTime).toISOString().slice(0, 16),
      type: timer.type,
    });
    setShowCreateForm(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm("Are you sure you want to delete this timer?")) {
        try {
          await deleteTimer(id);
          showSuccess("Timer Deleted", "Timer has been deleted successfully");
        } catch (error) {
          console.error("Error deleting timer:", error);
          showError("Timer Deletion Failed", "Failed to delete timer");
        }
      }
    },
    [deleteTimer, showSuccess, showError]
  );

  const handleToggleStatus = useCallback(
    async (id: string, currentStatus: boolean) => {
      try {
        await toggleTimerStatus(id, !currentStatus);
        showSuccess(
          "Status Updated",
          `Timer ${!currentStatus ? "activated" : "deactivated"} successfully`
        );
      } catch (error) {
        console.error("Error toggling timer status:", error);
        showError("Status Update Failed", "Failed to update timer status");
      }
    },
    [toggleTimerStatus, showSuccess, showError]
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

const getStatusBadge = (timer: Timer) => {
  const isActive = timer.isActive;
  const now = new Date();
  const startTime = new Date(timer.startTime);
  const endTime = new Date(timer.endTime);

    if (!isActive) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-white/10 text-white/70 rounded-full">
          Inactive
        </span>
      );
    }
  if (now < startTime) {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full">
        Upcoming
      </span>
    );
  }
    if (now >= startTime && now <= endTime) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded-full">
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded-full">
        Expired
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      GENERAL: "bg-white/10 text-white/70",
      PRESALE: "bg-amber-500/10 text-amber-400",
      STAKING: "bg-green-500/10 text-green-400",
      VESTING: "bg-amber-500/10 text-amber-400",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          typeColors[type as keyof typeof typeColors] || typeColors.GENERAL
        }`}
      >
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">
          Error loading timers: {error}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 w-full max-w-full overflow-x-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h3 className="text-xl font-semibold">
          Timer Management
        </h3>
        <motion.button
          onClick={() => {
            if (timers.length >= 1) {
              showInfo(
                "Limit Reached",
                "Only one timer is allowed. Edit or delete the existing timer."
              );
              return;
            }
            setShowCreateForm(true);
          }}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 w-full sm:w-auto justify-center ${
            timers.length >= 1
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-amber-600 text-white hover:bg-amber-700"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus /> Add Timer
        </motion.button>
      </div>

      {/* Info Alert */}
      {timers.length >= 1 && (
        <div className="p-4 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-sm sm:text-base">
          Only one timer can exist at a time. Use Edit to modify it.
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-thirdBgColor p-4 sm:p-6 rounded-lg border border-bgColor/60"
        >
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingTimer ? "Edit Timer" : "Create New Timer"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-bgColor/60 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-fourthBgColor text-white"
                  required
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="PRESALE">Presale</option>
                  <option value="STAKING">Staking</option>
                  <option value="VESTING">Vesting</option>
                </select>
              </div> */}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-bgColor/60 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-fourthBgColor text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-bgColor/60 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-fourthBgColor text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-bgColor/60 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-fourthBgColor text-white"
                  required
                />
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {editingTimer ? "Update Timer" : "Create Timer"}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTimer(null);
                  setFormData({
                    name: "",
                    description: "",
                    startTime: "",
                    endTime: "",
                    type: "GENERAL",
                  });
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Timers List */}
      <div className="space-y-4">
        {timers.map((timer) => (
          <motion.div
            key={timer._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-thirdBgColor p-4 sm:p-6 rounded-lg border border-bgColor/60 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-white break-words">
                    {timer.name}
                  </h4>
                  {getStatusBadge(timer)}
                  {getTypeBadge(timer.type)}
                </div>
                {timer.description && (
                  <p className="text-white/70 mb-3 break-words">
                    {timer.description}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-white/60">
                      Start:
                    </span>
                    <span className="ml-2 text-white">
                      {formatDate(timer.startTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">
                      End:
                    </span>
                    <span className="ml-2 text-white">
                      {formatDate(timer.endTime)}
                    </span>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-end">
                <motion.button
                  onClick={() => handleToggleStatus(timer._id, timer.isActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    timer.isActive
                      ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={timer.isActive ? "Deactivate Timer" : "Activate Timer"}
                >
                  {timer.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                </motion.button>
                <motion.button
                  onClick={() => handleEdit(timer)}
                  className="p-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit />
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(timer._id)}
                  className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiTrash2 />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {timers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No timers found. Create your first timer to get started.
        </div>
      )}
    </div>
  );
}
