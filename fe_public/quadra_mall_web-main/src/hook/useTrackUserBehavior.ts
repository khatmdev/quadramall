import apiClient from "@/api/config/apiClient";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

type BehaviorType = "VIEW" | "LIKE" | "ADD_TO_CART" | "PURCHASE";

export function useTrackUserBehavior() {
  const user = useSelector((state: RootState) => state.auth.user);

  const track = (productId: number, behavior: BehaviorType) => {
    if (!user) return;

    apiClient.post("/user/behavior", {
      productId,
      behaviorType: behavior,
    }).catch(() => {});
  };

  return { track };
}
