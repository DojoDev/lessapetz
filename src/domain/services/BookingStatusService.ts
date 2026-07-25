import { BookingStatus } from '../entities/Booking';

export class BookingStatusService {
  // Allowed standard transitions
  private static allowedStandardTransitions: Record<string, BookingStatus> = {
    SCHEDULED: 'PET_ARRIVED',
    PET_ARRIVED: 'IN_PROGRESS',
    IN_PROGRESS: 'READY_FOR_PICKUP',
    READY_FOR_PICKUP: 'COMPLETED',
  };

  // Alternative transitions (e.g. to CANCELLED)
  private static allowedAlternativeTransitions: Record<string, BookingStatus[]> = {
    SCHEDULED: ['CANCELLED', 'NO_SHOW'],
    PET_ARRIVED: ['CANCELLED'],
    IN_PROGRESS: ['CANCELLED'],
    READY_FOR_PICKUP: ['CANCELLED'],
  };

  /**
   * Check if a status transition is valid based on standard business rules
   */
  static canTransition(currentStatus: BookingStatus, nextStatus: BookingStatus, isAdminOverride: boolean = false): boolean {
    if (isAdminOverride) {
      return true;
    }

    if (currentStatus === nextStatus) return false;

    // Blocked from terminal states for regular users
    if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(currentStatus)) {
      return false;
    }

    // Check standard sequential transition
    if (this.allowedStandardTransitions[currentStatus] === nextStatus) {
      return true;
    }

    // Check alternative transitions (like cancelling)
    const alternatives = this.allowedAlternativeTransitions[currentStatus] || [];
    if (alternatives.includes(nextStatus)) {
      return true;
    }

    return false;
  }

  /**
   * Get UI configuration for a specific status
   */
  static getStatusConfig(status: BookingStatus) {
    const config: Record<BookingStatus, { label: string, color: string, badgeVariant: string }> = {
      SCHEDULED: { label: 'Agendado', color: 'blue', badgeVariant: 'blue' },
      PET_ARRIVED: { label: 'Pet chegou', color: 'yellow', badgeVariant: 'warning' },
      IN_PROGRESS: { label: 'Em atendimento', color: 'purple', badgeVariant: 'purple' },
      READY_FOR_PICKUP: { label: 'Pronto para retirada', color: 'green', badgeVariant: 'success' },
      COMPLETED: { label: 'Finalizado', color: 'slate', badgeVariant: 'secondary' },
      CANCELLED: { label: 'Cancelado', color: 'red', badgeVariant: 'destructive' },
      NO_SHOW: { label: 'Faltou', color: 'orange', badgeVariant: 'orange' }
    };
    return config[status] || config['SCHEDULED'];
  }

  /**
   * Get the primary recommended action for a status
   */
  static getPrimaryAction(status: BookingStatus): { label: string, nextStatus: BookingStatus } | null {
    const nextStatus = this.allowedStandardTransitions[status];
    if (!nextStatus) return null;

    const actionLabels: Record<BookingStatus, string> = {
      PET_ARRIVED: 'Marcar chegada',
      IN_PROGRESS: 'Iniciar atendimento',
      READY_FOR_PICKUP: 'Marcar como pronto',
      COMPLETED: 'Finalizar atendimento',
      SCHEDULED: '', CANCELLED: '', NO_SHOW: ''
    };

    return {
      label: actionLabels[nextStatus],
      nextStatus
    };
  }
}
