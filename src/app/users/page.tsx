"use client";

import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useUsers, UserResponse, useDeleteUser } from "@/hooks/useUsers";
import { User, Mail, Shield, Plus, Pencil, Trash2 } from "lucide-react";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import Swal from "sweetalert2";

export default function UsersPage() {
  const { data: users, isLoading, isError } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const handleDeactivate = (user: UserResponse) => {
    Swal.fire({
      title: "Deactivate User?",
      text: `User "${user.username}" will no longer have access.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, deactivate",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUserMutation.mutate(user.id, {
          onSuccess: () => {
            Swal.fire("Deactivated!", "User has been deactivated.", "success");
          },
          onError: () => {
            Swal.fire("Error!", "Failed to deactivate user.", "error");
          },
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage users for this organization
            </p>
          </div>

          <Button onClick={() => setOpenAdd(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Users List
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {isError && (
              <ErrorState
                title="Failed to Load Users"
                description="Failed to load users list. Please try again later."
                className="min-h-[300px]"
              />
            )}

            {isLoading && (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            )}

            {!isLoading && !isError && (
              <>
                {!users?.length ? (
                  <ErrorState
                    title="No Users Found"
                    description="No users have been added to this organization yet."
                    icon={User}
                    className="min-h-[400px]"
                  />
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 text-sm">
                          <th className="text-left font-semibold py-3 px-5 w-[25%]">
                            Name
                          </th>
                          <th className="text-left font-semibold py-3 px-5 w-[30%]">
                            Email
                          </th>
                          <th className="text-left font-semibold py-3 px-5 w-[20%]">
                            Role
                          </th>
                          <th className="text-center font-semibold py-3 px-5 w-[10%]">
                            Active
                          </th>
                          <th className="text-center font-semibold py-3 px-5 w-[15%]">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="text-sm">
                        {users.map((user, index) => (
                          <tr
                            key={user.id}
                            className={`transition-colors border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } hover:bg-blue-50`}
                          >
                            {/* Name */}
                            <td className="py-3 px-5 text-gray-900 font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                {user.username}
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-3 px-5 text-gray-700 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                {user.email}
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-3 px-5 whitespace-nowrap">
                              <span
                                className={`text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide ${user.role === "PRODUCT_SUPPORT_ADMIN"
                                  ? "bg-purple-100 text-purple-700"
                                  : user.role === "SYSTEM_ADMIN"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-200 text-gray-700"
                                  }`}
                              >
                                {user.role.replace("_", " ")}
                              </span>
                            </td>

                            {/* Active Status */}
                            <td className="py-3 px-5 whitespace-nowrap text-center">
                              <span
                                className={`text-[11px] font-semibold px-3 py-1 rounded-full ${user.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-300 text-gray-600"
                                  }`}
                              >
                                {user.is_active ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-5 whitespace-nowrap">
                              <div className="flex justify-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 border-gray-400 hover:border-blue-600 hover:bg-blue-50"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setOpenEdit(true);
                                  }}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4 text-gray-700" />
                                </Button>

                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
                                  onClick={() => handleDeactivate(user)}
                                  disabled={deleteUserMutation.isPending}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <AddUserModal open={openAdd} onClose={() => setOpenAdd(false)} />
        <EditUserModal
          open={openEdit}
          user={selectedUser}
          onClose={() => {
            setOpenEdit(false);
            setSelectedUser(null);
          }}
        />
      </div>
    </div>
  );
}
