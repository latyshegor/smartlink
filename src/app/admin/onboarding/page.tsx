import { requireArtist } from "@/lib/auth";
import { OnboardingWizard } from "@/components/admin/OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function Onboarding() {
  const artist = await requireArtist();
  return (
    <div className="admin-surface min-h-screen">
      <OnboardingWizard artistName={artist.name} />
    </div>
  );
}
