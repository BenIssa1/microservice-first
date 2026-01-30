import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class PaymentEventsController {
  @EventPattern('payment.required')
  handlePaymentRequired(payload: {
    reservationId: number;
    amount: number;
    userId: number;
  }) {
    console.log('Payment required for reservation:', payload.reservationId);
    // Le paiement est créé via l’API POST /payments quand l’utilisateur paie
  }
}
