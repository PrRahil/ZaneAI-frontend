import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export const useRoleRedirect = () => {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token && user) {
      if (user.role === "SYSTEM_ADMIN" || user.role === "MEMBER") {
        if (user.is_connection_setup) {
          router.push("/overview");
        } else {
          router.push("/setup/database");
        }
      } else if (user.role === "PRODUCT_SUPPORT_ADMIN") {
        router.push("/organization");
      } else {
        router.push("/setup/database");
      }
    }
  }, [user, token, router]);
};
