"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Check,
  UserCog,
  Shield,
  Map,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { userApi, tourApi, type UserData, type TourData } from "@/lib/api";
import { toast } from "sonner";

interface User extends UserData {
  isEditing?: boolean;
  tours?: TourData[];
  showTours?: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loadingTours, setLoadingTours] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "tourist",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userApi.getAll();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setError(result.error || "Failed to load users");
      }
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTours = async (userId: number) => {
    setLoadingTours(userId);
    try {
      const result = await tourApi.getUserTours(userId);
      if (result.success && result.data) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, tours: result.data } : u)));
      }
    } catch {
      console.error("Failed to fetch user tours");
    } finally {
      setLoadingTours(null);
    }
  };

  const toggleUserTours = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user?.showTours) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, showTours: false } : u)));
    } else {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, showTours: true } : u)));
      if (!user?.tours) {
        fetchUserTours(userId);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await userApi.create(formData);
      if (result.success && result.data) {
        setUsers([result.data, ...users]);
        setIsAddingUser(false);
        setFormData({ email: "", password: "", name: "", role: "tourist" });
        toast.success("User created successfully");
      } else {
        toast.error(result.error || "Failed to create user");
      }
    } catch {
      toast.error("Failed to create user");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const result = await userApi.update(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      });
      if (result.success && result.data) {
        setUsers(users.map((u) => (u.id === editingUser.id ? result.data! : u)));
        setEditingUser(null);
        toast.success("User updated successfully");
      } else {
        toast.error(result.error || "Failed to update user");
      }
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const result = await userApi.delete(id);
      if (result.success) {
        setUsers(users.filter((u) => u.id !== id));
        toast.success("User deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "guide":
        return <UserCog className="h-4 w-4 text-blue-600" />;
      default:
        return <Users className="h-4 w-4 text-green-600" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "guide":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-500">Manage users, roles, and permissions.</p>
        </div>
        <button
          onClick={() => setIsAddingUser(true)}
          className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["all", "admin", "guide", "tourist"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  roleFilter === role
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
              <button onClick={fetchUsers} className="ml-2 underline">
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tours</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <>
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <span className="text-sm font-bold text-slate-600">
                                {user.name?.charAt(0).toUpperCase() ||
                                  user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{user.name || "N/A"}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getRoleBadgeClass(
                              user.role
                            )}`}
                          >
                            {getRoleIcon(user.role)}
                            <span className="ml-1">{user.role}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleUserTours(user.id)}
                            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            {loadingTours === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.showTours ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <Map className="h-4 w-4" />
                            <span>
                              {user.tours
                                ? `${user.tours.length} tour${user.tours.length !== 1 ? "s" : ""}`
                                : "View"}
                            </span>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {user.showTours && user.tours && (
                        <tr key={`${user.id}-tours`}>
                          <td colSpan={5} className="px-6 py-4 bg-slate-50">
                            <div className="pl-4 border-l-2 border-slate-300">
                              <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                                Participating Tours
                              </p>
                              {user.tours.length === 0 ? (
                                <p className="text-sm text-slate-400">No tours yet</p>
                              ) : (
                                <div className="space-y-2">
                                  {user.tours.map((tour) => (
                                    <div
                                      key={tour.id}
                                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200"
                                    >
                                      <div>
                                        <p className="text-sm font-bold text-slate-800">
                                          {tour.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {tour.start_date && tour.end_date
                                            ? `${new Date(tour.start_date).toLocaleDateString()} - ${new Date(tour.end_date).toLocaleDateString()}`
                                            : "Dates not set"}
                                        </p>
                                      </div>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                                          tour.status === "planned"
                                            ? "bg-blue-100 text-blue-700"
                                            : tour.status === "ongoing"
                                              ? "bg-green-100 text-green-700"
                                              : tour.status === "completed"
                                                ? "bg-gray-100 text-gray-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {tour.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Add New User</h3>
                <p className="text-sm text-slate-500">Create a new user account.</p>
              </div>
              <button
                onClick={() => setIsAddingUser(false)}
                className="p-2 hover:bg-slate-200 rounded-full"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                <input
                  required
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input
                  required
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input
                  required
                  type="password"
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                <select
                  className="input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="tourist">Tourist</option>
                  <option value="guide">Guide</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all flex items-center justify-center"
                >
                  <Check className="h-4 w-4 mr-2" /> Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Edit User</h3>
                <p className="text-sm text-slate-500">Update user information.</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-slate-200 rounded-full"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                <input
                  required
                  type="text"
                  className="input"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input
                  required
                  type="email"
                  className="input"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                <select
                  className="input"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as "admin" | "guide" | "tourist",
                    })
                  }
                >
                  <option value="tourist">Tourist</option>
                  <option value="guide">Guide</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all flex items-center justify-center"
                >
                  <Check className="h-4 w-4 mr-2" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
