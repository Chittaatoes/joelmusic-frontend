import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  DollarSign,
  TrendingUp,
  Wrench,
  Calendar,
  Plus,
  Music,
  Clock,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Booking, DailyCost } from "@shared/schema";

const ADMIN_EMAIL = "joelmusic@gmail.com";

const LAYANAN_MAP: Record<string, string> = {
  rehearsal: "Rehearsal",
  karaoke: "Karaoke",
  live_recording: "Live Record",
  cover_lagu: "Cover Lagu",
  cover_lagu_video: "Cover Lagu + Video",
};

function getLayananLabel(val: string) {
  return LAYANAN_MAP[val] || val;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [authChecked, setAuthChecked] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [costAmount, setCostAmount] = useState("");
  const [costDesc, setCostDesc] = useState("");

  // 🔐 AUTH GUARD (FIXED VERSION)
  useEffect(() => {
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setLocation("/admin");
      return;
    }

    setAuthChecked(true);
  };

  checkAuth();
}, []);

  // DATA FETCHING
  const { data: bookings = [], isLoading: loadingBookings } =
    useQuery<Booking[]>({
      queryKey: ["/api/admin/bookings/" + selectedDate],
      enabled: authChecked,
    });

  const { data: costs = [], isLoading: loadingCosts } =
    useQuery<DailyCost[]>({
      queryKey: ["/api/admin/costs/" + selectedDate],
      enabled: authChecked,
    });

  const addCostMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/costs", {
        tanggal: selectedDate,
        cost: parseInt(costAmount),
        keterangan: costDesc,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/costs/" + selectedDate],
      });
      setCostDialogOpen(false);
      setCostAmount("");
      setCostDesc("");
      toast({ title: "Cost berhasil ditambahkan" });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menambahkan cost",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  );

  const pendapatan = confirmedBookings.reduce(
    (sum, b) => sum + b.total,
    0
  );

  const totalCost = costs.reduce((sum, c) => sum + c.cost, 0);

  const profit = pendapatan - totalCost;

  const displayDate = format(
    new Date(selectedDate + "T00:00:00"),
    "EEEE, dd MMMM yyyy",
    { locale: idLocale }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Booking Hari Ini</h1>
        <p className="text-sm text-muted-foreground">
          Booking dan profit berdasarkan tanggal
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="max-w-[200px]"
        />
      </div>

      <p className="text-sm text-muted-foreground">{displayDate}</p>

      {loadingBookings || loadingCosts ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-4 w-4 text-blue-600" />}
            label="Total Group"
            value={confirmedBookings.length}
          />

          <StatCard
            icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
            label="Pendapatan"
            value={`Rp ${pendapatan.toLocaleString("id-ID")}`}
          />

          <StatCard
            icon={<Wrench className="h-4 w-4 text-amber-600" />}
            label="Cost"
            value={`Rp ${totalCost.toLocaleString("id-ID")}`}
          />

          <StatCard
            icon={<TrendingUp className="h-4 w-4 text-green-600" />}
            label="Profit"
            value={`Rp ${profit.toLocaleString("id-ID")}`}
          />
        </div>
      )}
    </div>
  );
}

// Reusable Stat Card
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <Card className="p-4 space-y-1">
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-muted p-1.5">{icon}</div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}