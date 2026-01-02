import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import type { Availability, User } from "../lib/types";
import AuthenticatedLayout from "../components/layouts/authenticated-layout";
import AvailabilityForm from "../components/availability/availability-form";
import AvailabilityView from "../components/availability/availability-view";

import {
  fetchAvailabilities,
  fetchTrainerAvailabilities,
  updateTrainerAvailabilities,
  fetchTrainers,
} from "../api/availability";

export default function AvailabilityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    if (user.role === "admin") {
      Promise.all([fetchAvailabilities(), fetchTrainers()])
        .then(([avails, trainers]) => {
          setAvailabilities(avails ?? []);
          setTrainers(trainers ?? []);
        })
        .finally(() => setLoading(false));
    } else if (user.role === "trainer") {
      fetchTrainerAvailabilities(user.id)
        .then(avails => setAvailabilities(avails ?? []))
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load your availabilities.",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [user, toast]);

  const handleAvailabilityUpdate = useCallback(
    async (updatedAvailabilities: Availability[]) => {
      if (!user) return;
      try {
        await updateTrainerAvailabilities(user.id, updatedAvailabilities);
        // Refetch from backend to get the latest data
        const fresh = await fetchTrainerAvailabilities(user.id);
        setAvailabilities(fresh);
        toast({
          title: "Availability Updated",
          description: "Your weekly availability has been saved successfully.",
        });
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update availability.",
        });
      }
    },
    [user, toast]
  );

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <p>Loading availabilities...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {user?.role === "trainer" && (
          <AvailabilityForm
            trainerId={user.id}
            initialAvailabilities={availabilities.filter(
              (a) => String(a.trainerId) === String(user.id)
            )}
            onUpdate={handleAvailabilityUpdate}
          />
        )}

        {user?.role === "admin" && (
          <AvailabilityView availabilities={availabilities} trainers={trainers} />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
