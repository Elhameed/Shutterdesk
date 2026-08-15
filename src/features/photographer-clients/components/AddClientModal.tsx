import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Contact,
  Mail,
  Phone,
  Plus,
  Shapes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ADD_CLIENT_COPY } from "@/constants/photographer-add-client";
import type { ClientCategory } from "@/types/domains/photographer-client";

type AddClientModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (client: {
    name: string;
    email: string;
    phone: string;
    category: ClientCategory;
    location?: string;
    notes?: string;
  }) => void | Promise<void>;
};

export function AddClientModal({
  open,
  onClose,
  onCreated,
}: AddClientModalProps) {
  const copy = ADD_CLIENT_COPY;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    void onCreated?.({
      name: fullName.trim() || "New Client",
      email: email.trim() || "client@shutterdesk.rw",
      phone: phone.trim() || "+250 788 000 000",
      category: (category || "portrait") as ClientCategory,
      location: address.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setFullName("");
    setEmail("");
    setPhone("");
    setCategory("");
    setAddress("");
    setNotes("");
    setOptionalOpen(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={copy.title}
      description={copy.description}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            {copy.cancel}
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmit}>
            {copy.createClient}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">
              {copy.personalInformation}
            </h3>
            <span className="rounded-full bg-gold-light px-2 py-0.5 text-[10px] font-bold tracking-wide text-charcoal uppercase">
              {copy.required}
            </span>
          </div>

          <div className="space-y-2">
            <Label required>{copy.fullName}</Label>
            <div className="relative">
              <Contact className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder={copy.fullNamePlaceholder}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label required>{copy.emailAddress}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label required>{copy.phoneNumber}</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder={copy.phonePlaceholder}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">
            {copy.clientClassification}
          </h3>
          <div className="space-y-2">
            <Label>{copy.clientCategory}</Label>
            <div className="relative">
              <Shapes className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted" />
              <Select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="pl-10"
              >
                <option value="">{copy.categoryPlaceholder}</option>
                {Object.entries(copy.categories).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setOptionalOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-gray-50/50 px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-muted uppercase">
              <Plus className="size-3.5" />
              {copy.optionalInformation}
            </span>
            {optionalOpen ? (
              <ChevronUp className="size-4 text-muted" />
            ) : (
              <ChevronDown className="size-4 text-muted" />
            )}
          </button>

          {optionalOpen && (
            <div className="mt-4 space-y-4 rounded-lg border border-border bg-white p-4">
              <div className="space-y-2">
                <Label>{copy.address}</Label>
                <Textarea
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder={copy.addressPlaceholder}
                  className="min-h-20"
                />
              </div>
              <div className="space-y-2">
                <Label>{copy.notes}</Label>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={copy.notesPlaceholder}
                  className="min-h-20"
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
