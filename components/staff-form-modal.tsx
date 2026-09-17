"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createStaff, updateStaff } from "@/app/dashboard/staff/actions";
import type { Staff } from "@/types/database";

type StaffFormModalProps = {
  open: boolean;
  onClose: () => void;
  staff?: Staff;
};

export function StaffFormModal({ open, onClose, staff }: StaffFormModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(staff?.name ?? "");
  const [phone, setPhone] = useState(staff?.phone ?? "");
  const [specialty, setSpecialty] = useState(staff?.specialty ?? "");
  const [photoUrl, setPhotoUrl] = useState(staff?.photo_url ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = staff
        ? await updateStaff({ id: staff.id, name, phone, specialty, photoUrl })
        : await createStaff({ name, phone, specialty, photoUrl });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(staff ? "Personel güncellendi." : "Personel eklendi.");
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={staff ? "Personeli düzenle" : "Yeni personel ekle"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="staff-name">Ad soyad</Label>
          <Input
            id="staff-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Mehmet Demir"
          />
        </div>
        <div>
          <Label htmlFor="staff-phone">Telefon (opsiyonel)</Label>
          <Input id="staff-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="staff-specialty">Uzmanlık (opsiyonel)</Label>
          <Input
            id="staff-specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Örn. Saç kesimi, sakal tıraşı"
          />
        </div>
        <div>
          <Label htmlFor="staff-photo">Fotoğraf URL (opsiyonel)</Label>
          <Input
            id="staff-photo"
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="submit" isLoading={isPending}>
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
