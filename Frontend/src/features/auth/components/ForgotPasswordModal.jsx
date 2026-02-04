import { Mail } from "lucide-react";
import { Button, Modal } from "../../../shared/components";

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  email,
  onEmail,
  onSubmit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recuperar contraseña"
      maxWidthClassName="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="blue" type="submit" form="forgot-password-form">
            Enviar enlace
          </Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600 mt-1">Te enviaremos un enlace a tu correo.</p>

      <form id="forgot-password-form" onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label className="label block mb-1">Correo</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              className="input pl-12"
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
