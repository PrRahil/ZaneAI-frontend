"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGithubInstallations,
  useGithubRepositories,
  useGithubSyncRepositories,
} from "@/hooks/useGithub";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { Github, CheckCircle, ArrowRight, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

export default function RepositorySetup() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const ORG_ID = user?.org_id;

  const [step, setStep] = useState(1);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [isLoadingInstall, setIsLoadingInstall] = useState(false);

  const { data: installationList, isLoading: loadingInstallations } =
    useGithubInstallations();

  const installationId = installationList?.[0]?.id || null;

  const { data: repositories, isLoading } = useGithubRepositories(
    installationId || undefined,
  );

  useEffect(() => {
    if (installationId) {
      setStep(2);
    }
  }, [installationId]);

  const handleGoBack = () => {
    setStep(1);
    setSelectedRepos([]);
  };

  const handleInstallGithubApp = async () => {
    if (!ORG_ID) {
      toast.error("Organization not found. Please login again.");
      return;
    }

    try {
      setIsLoadingInstall(true);

      window.open(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}github/install?org_id=${ORG_ID}`,
        "_blank",
      );

      toast("Complete installation in GitHub, then return here");
    } catch (err) {
      toast.error("Failed to start installation");
    } finally {
      setIsLoadingInstall(false);
    }
  };

  const syncRepos = useGithubSyncRepositories();

  const handleCompleteSetup = () => {
    syncRepos.mutate(
      {
        installation_id: installationId!,
        repositories: selectedRepos,
      },
      {
        onSuccess: () => {
          toast.success("Repositories synced!");
          router.push("/setup/jira");
        },
        onError: () => toast.error("Sync failed!"),
      },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl py-6">
        <div className="text-center mb-6">
          <Github className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Repository Setup</h1>
          <p className="text-sm text-muted-foreground">
            Connect GitHub to sync your repositories
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span>Database</span>
            </div>
            <ArrowRight />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                2
              </div>
              <span>Repository</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Install GitHub App</CardTitle>
              <CardDescription>
                Install Zane.AI GitHub App to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={isLoadingInstall}
                onClick={handleInstallGithubApp}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Install GitHub App
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-3">
                After installing, return to this page.
              </p>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Repositories</CardTitle>
              <CardDescription>
                Choose repositories Zane.AI should analyze
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {isLoading && <p>Loading repositories…</p>}
              {repositories?.map((repo: any) => (
                <div
                  key={repo.repo_name}
                  className="flex items-start p-3 border rounded-lg space-x-3"
                >
                  <Checkbox
                    checked={selectedRepos.includes(repo.repo_name)}
                    onCheckedChange={() =>
                      setSelectedRepos((prev) =>
                        prev.includes(repo.repo_name)
                          ? prev.filter((x) => x !== repo.repo_name)
                          : [...prev, repo.repo_name],
                      )
                    }
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={repo.repo_name}
                        className="font-medium cursor-pointer"
                      >
                        {repo.repo_name}
                      </label>
                      <Badge variant={repo.private ? "secondary" : "outline"}>
                        {repo.private ? "Private" : "Public"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {repo.description}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleGoBack}
                >
                  ← Back to Installation
                </Button>

                <Button
                  className="flex-1"
                  disabled={selectedRepos.length === 0}
                  onClick={handleCompleteSetup}
                >
                  Complete Setup ({selectedRepos.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
