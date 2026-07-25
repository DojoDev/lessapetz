export interface AppointmentReadyForPickupEventPayload {
  appointmentId: string;
  organizationId: string;
  customerId: string;
  petId: string;
  changedAt: string;
}

export class AppointmentReadyForPickupEvent {
  /**
   * Dispatch the ready for pickup event.
   * This is currently a simple lightweight hook, prepared for future WhatsApp integration.
   */
  static dispatch(payload: AppointmentReadyForPickupEventPayload) {
    console.log('[EVENT] AppointmentReadyForPickupEvent dispatched:', JSON.stringify(payload));
    // In the future, this can trigger a queue message, webhook, or direct WhatsApp service call.
  }
}
