"use client";

import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  Plus,
  AlertTriangle,
  Pencil,
  Trash,
} from "lucide-react";
import AddOrganizationModal from "./AddOrganizationModal";
import EditOrganizationModal from "./EditOrganizationModal";
import {
  useDeleteOrganization,
  useOrganizations,
} from "@/hooks/useOrganization";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export default function OrganizationPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useOrganizations();
  const deleteOrgMutation = useDeleteOrganization();

  const totalOrganizations = data?.total_organizations ?? 0;
  const totalUsers = data?.total_users ?? 0;

  const organizations =
    data?.organizations?.map((item) => ({
      id: item.organization.id,
      name: item.organization.name,
      isActive: item.organization.is_active,
      adminCount:
        item.role_counts.PRODUCT_SUPPORT_ADMIN +
        item.role_counts.SYSTEM_ADMIN +
        item.role_counts.ORGANIZATION_ADMIN,
      userCount: item.role_counts.total,
    })) || [];

  // Delete handler
  const handleDelete = (org: { id: string; name: string }) => {
    Swal.fire({
      title: "Delete Organization?",
      text: `Organization "${org.name}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteOrgMutation.mutate(org.id, {
          onSuccess: () => {
            Swal.fire("Deleted!", "Organization has been removed.", "success");
          },
          onError: () => {
            Swal.fire("Error!", "Failed to delete organization.", "error");
          },
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organizations</h1>
            <p className="text-muted-foreground">
              Manage all organizations inside the system
            </p>
          </div>

          <Button className="gap-2" onClick={() => setOpenAdd(true)}>
            <Plus className="h-4 w-4" />
            Add Organization
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4 shadow-sm border rounded-xl">
            <p className="text-muted-foreground text-sm">Total Organizations</p>
            <h2 className="text-2xl font-bold">{totalOrganizations}</h2>
          </Card>

          <Card className="p-4 shadow-sm border rounded-xl">
            <p className="text-muted-foreground text-sm">Total Users</p>
            <h2 className="text-2xl font-bold">{totalUsers}</h2>
          </Card>
        </div>

        {/* Organization List */}
        <Card className="shadow-sm border rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Organization List
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Error */}
            {isError && (
              <div className="flex flex-col items-center text-center py-10 text-red-500">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <span className="font-medium">Failed to load organizations</span>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => refetch()}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            )}

            {/* Empty */}
            {!isLoading && !isError && organizations.length === 0 && (
              <p className="text-center text-muted-foreground py-10">
                No organizations found.
              </p>
            )}

            {/* Table */}
            {!isLoading && !isError && organizations.length > 0 && (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-semibold">
                        Organization
                      </th>
                      <th className="p-3 text-left font-semibold">Admins</th>
                      <th className="p-3 text-left font-semibold">Users</th>
                      <th className="p-3 text-left font-semibold">Status</th>
                      <th className="p-3 text-center font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {organizations.map((org) => (
                      <tr
                        key={org.id}
                        className="border-b hover:bg-muted/40 transition"
                      >
                        <td className="p-3 font-medium">{org.name}</td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            {org.adminCount}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />
                            {org.userCount}
                          </div>
                        </td>

                        <td className="p-3">
                          <span
                            className={
                              org.isActive
                                ? "text-green-600 font-medium"
                                : "text-red-500 font-medium"
                            }
                          >
                            {org.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedOrg(org);
                                setOpenEdit(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => handleDelete(org)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddOrganizationModal
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          refetch();
        }}
      />

      <EditOrganizationModal
        open={openEdit}
        org={selectedOrg}
        onClose={() => {
          setOpenEdit(false);
          setSelectedOrg(null);
        }}
      />
    </div>
  );
}
