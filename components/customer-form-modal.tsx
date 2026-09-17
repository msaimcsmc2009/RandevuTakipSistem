"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createCustomer, updateCustomer } from "@/app/dashboard/customers/actions";
import type { Customer } from "@/types/database";

type CustomerFormModalProps = {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
};

export function CustomerFormModal({ open, onClose, customer }: CustomerFormModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [birthDate, setBirthDate] = useState(customer?.birth_date ?? "");
  const [notes, setNotes] = useState(customer?.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = customer
        ? await updateCustomer({ id: customer.id, name, phone, email, birthDate, notes })
        : await createCustomer({ name, phone, email, birthDate, notes });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(customer ? "Müşteri güncellendi." : "Müşteri eklendi.");
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? "Müşteriyi düzenle" : "Yeni müşteri ekle"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="customer-name">Ad soyad</Label>
          <Input
            id="customer-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Ayşe Yılmaz"
          />
        </div>
        <div>
          <Label htmlFor="customer-phone">Telefon</Label>
          <Input
            id="customer-phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
          />
        </div>
        <div>
          <Label htmlFor="customer-email">E-posta (opsiyonel)</Label>
          <Input
            id="customer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="customer-birth-date">Doğum tarihi (opsiyonel)</Label>
          <Input
            id="customer-birth-date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="customer-notes">Notlar (opsiyonel)</Label>
          <Textarea
            id="customer-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
