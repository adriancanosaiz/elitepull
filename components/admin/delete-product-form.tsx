"use client";

import type { FormEvent } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function DeleteProductForm({
  action,
  productId,
  redirectTo,
  productName,
}: {
  action: (formData: FormData) => void | Promise<void>;
  productId: string;
  redirectTo: string;
  productName: string;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `Vas a eliminar "${productName}". Esta accion no se puede deshacer.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <DeleteProductButton />
    </form>
  );
}

function DeleteProductButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="border-rose-400/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20 hover:text-white"
    >
      {pending ? "Eliminando..." : "Eliminar producto"}
    </Button>
  );
}
