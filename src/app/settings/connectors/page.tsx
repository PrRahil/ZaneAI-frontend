"use client";

import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import {
  useGetConnections as useGetSnowflakeConnections,
  useDeleteConnection as useDeleteSnowflakeConnection,
} from "@/hooks/useSnowflake";
import {
  useGithubInstallations,
  useGithubDeactivateInstallation,
} from "@/hooks/useGithub";
import {
  useGetJiraConnections,
  useDeleteJiraConnection,
} from "@/hooks/useJira";
import {
  useGetDbtCloudConnections,
  useDeleteDbtCloudConnection,
} from "@/hooks/useDbtCloud";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Github, Settings, Plus, Loader2, GitBranch, ExternalLink, Cloud, Trash2 } from "lucide-react";
import EditSnowflakeModal from "./snowflake/EditSnowflakeModal";
import Swal from "sweetalert2";
import { parseErrorMessage } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import EditJiraModal from "./jira/EditJiraModal";
import EditDbtCloudModal from "./dbt-cloud/EditDbtCloudModal";

export default function ConnectorsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { data: snowflakeConnections, isLoading: loadingSnowflake } = useGetSnowflakeConnections();
  const { data: githubInstallations, isLoading: loadingGithub } = useGithubInstallations();
  const { data: jiraConnections, isLoading: loadingJira } = useGetJiraConnections();
  const { data: dbtConnections, isLoading: loadingDbt } = useGetDbtCloudConnections();

  const deactivateGithub = useGithubDeactivateInstallation();
  const deleteSnowflake = useDeleteSnowflakeConnection();
  const deleteJira = useDeleteJiraConnection();
  const deleteDbt = useDeleteDbtCloudConnection();

  const [editSnowflakeOpen, setEditSnowflakeOpen] = useState(false);
  const [selectedSnowflake, setSelectedSnowflake] = useState<any>(null);

  const [editJiraOpen, setEditJiraOpen] = useState(false);
  const [selectedJira, setSelectedJira] = useState<any>(null);

  const [editDbtOpen, setEditDbtOpen] = useState(false);
  const [selectedDbt, setSelectedDbt] = useState<any>(null);

  const handleEditSnowflake = (conn: any) => {
    setSelectedSnowflake(conn);
    setEditSnowflakeOpen(true);
  };

  const handleAddSnowflake = () => {
    setSelectedSnowflake(null);
    setEditSnowflakeOpen(true);
  };

  const handleDeleteSnowflake = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSnowflake.mutate(id, {
          onSuccess: () => {
            Swal.fire("Deleted!", "Snowflake connection has been deleted.", "success");
          },
          onError: (error) => {
            const msg = parseErrorMessage(error);
            toast.error(msg || "Failed to delete Snowflake connection");
          }
        });
      }
    });
  };

  const handleManageGithub = () => {
    router.push("/setup/repository");
  };

  const handleEditJira = (conn: any) => {
    setSelectedJira(conn);
    setEditJiraOpen(true);
  };

  const handleEditDbt = (conn: any) => {
    setSelectedDbt(conn);
    setEditDbtOpen(true);
  };

  const handleDeleteJira = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteJira.mutate(id, {
          onSuccess: () => {
            Swal.fire("Deleted!", "Jira connection has been deleted.", "success");
          },
          onError: (error) => {
            const msg = parseErrorMessage(error);
            toast.error(msg || "Failed to delete Jira connection");
          }
        });
      }
    });
  };

  const handleDeleteDbt = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDbt.mutate(id, {
          onSuccess: () => {
            Swal.fire("Deleted!", "DBT Cloud connection has been deleted.", "success");
          },
          onError: (error) => {
            const msg = parseErrorMessage(error);
            toast.error(msg || "Failed to delete DBT Cloud connection");
          }
        });
      }
    });
  };

  const handleDeleteGithub = (installationId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deactivateGithub.mutate(installationId, {
          onSuccess: () => {
            Swal.fire("Deleted!", "Your installation has been deactivated.", "success");
          },
          onError: (error) => {
            const msg = parseErrorMessage(error);
            toast.error(msg || "Failed to deactivate installation");
          },
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Connectors</h1>
          <p className="text-sm text-muted-foreground">Manage your organization's integrations.</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Snowflake
                </CardTitle>
                <CardDescription>
                  Data Warehouse connection for verifying queries.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddSnowflake}>
                <Plus className="h-4 w-4 mr-2" />
                Add Connection
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingSnowflake ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="space-y-4">
                  {Array.isArray(snowflakeConnections) && snowflakeConnections.length > 0 ? (
                    snowflakeConnections.map((conn: any) => (
                      <div key={conn.id || 'snow'} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Database className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium leading-none">{conn.connection_name || "Snowflake Connection"}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Badge variant={conn.is_active ? "default" : "secondary"} className="text-xs h-5 px-1.5">
                                {conn.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <span>Account: {conn.account}</span>
                              <span>Warehouse: {conn.warehouse}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditSnowflake(conn)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSnowflake(conn.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground pl-1">No Snowflake connection found.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Github className="h-5 w-5 text-gray-900" />
                  GitHub
                </CardTitle>
                <CardDescription>
                  Source code repository synchronization.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleManageGithub}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Repos
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingGithub ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="space-y-4">
                  {githubInstallations && githubInstallations.length > 0 ? (
                    githubInstallations.map((inst: any) => (
                      <div key={inst.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Github className="h-5 w-5 text-gray-900" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium leading-none">{inst.account_login || inst.account_type || "GitHub Organization"}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Badge variant={inst.is_active ? "default" : "secondary"} className="text-xs h-5 px-1.5">
                                {inst.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <span>Installation ID: {inst.installation_id || inst.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={handleManageGithub}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteGithub(inst.installation_id || inst.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground pl-1">No GitHub App installation found.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-bold">J</div>
                  Jira
                </CardTitle>
                <CardDescription>
                  Issue tracking integration.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditJiraOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Connection
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingJira ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="space-y-4">
                  {Array.isArray(jiraConnections) && jiraConnections.length > 0 ? (
                    jiraConnections.map((conn: any) => (
                      <div key={conn.id || 'jira'} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            J
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium leading-none">{conn.connection_name || "Jira Connection"}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Badge variant={conn.is_active ? "default" : "secondary"} className="text-xs h-5 px-1.5">
                                {conn.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline" className="text-xs h-5 px-1.5 font-normal">
                                {conn.project_key}
                              </Badge>
                              <span>Issue Type: {conn.issue_type}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">{conn.server_url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditJira(conn)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteJira(conn.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground pl-1">No Jira connection found.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Cloud className="h-5 w-5 text-orange-500" />
                dbt Cloud
              </CardTitle>
              <CardDescription>
                Job orchestration and documentation synchronization.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditDbtOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingDbt ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="space-y-4">
                {Array.isArray(dbtConnections) && dbtConnections.length > 0 ? (
                  dbtConnections.map((conn: any) => (
                    <div key={conn.id || 'dbt'} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Cloud className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium leading-none">{conn.connection_name || "dbt Cloud Connection"}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant={conn.is_active ? "default" : "secondary"} className="text-xs h-5 px-1.5">
                              {conn.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <span>Account: {conn.account_id}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[300px]">{conn.base_url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditDbt(conn)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDbt(conn.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground pl-1">No dbt Cloud connection found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditSnowflakeModal
        open={editSnowflakeOpen}
        onClose={() => {
          setEditSnowflakeOpen(false);
          setSelectedSnowflake(null);
        }}
        connectionData={selectedSnowflake}
      />

      <EditJiraModal
        open={editJiraOpen}
        onClose={() => {
          setEditJiraOpen(false);
          setSelectedJira(null);
        }}
        connectionData={selectedJira}
      />

      <EditDbtCloudModal
        open={editDbtOpen}
        onClose={() => {
          setEditDbtOpen(false);
          setSelectedDbt(null);
        }}
        connectionData={selectedDbt}
      />
    </div>
  );
}
