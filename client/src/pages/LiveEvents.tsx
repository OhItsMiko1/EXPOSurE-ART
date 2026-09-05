import ComingSoon from "@/components/layout/ComingSoon";
import { Calendar } from "lucide-react";

export default function LiveEvents() {
  return (
    <ComingSoon
      icon={Calendar}
      title="Live Events — Coming Soon"
      description="We're building tools for artists to host live events — virtual gallery nights, workshops, and artist talks — right here on EXPOSurE.ART. Check back soon!"
    />
  );
}
