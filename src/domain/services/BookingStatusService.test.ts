import test from 'node:test';
import assert from 'node:assert';
import { BookingStatusService } from './BookingStatusService';
import { BookingStatus } from '../entities/Booking';

test('BookingStatusService', async (t) => {
  await t.test('canTransition - valid standard transitions', () => {
    assert.strictEqual(BookingStatusService.canTransition('SCHEDULED', 'PET_ARRIVED'), true);
    assert.strictEqual(BookingStatusService.canTransition('PET_ARRIVED', 'IN_PROGRESS'), true);
    assert.strictEqual(BookingStatusService.canTransition('IN_PROGRESS', 'READY_FOR_PICKUP'), true);
    assert.strictEqual(BookingStatusService.canTransition('READY_FOR_PICKUP', 'COMPLETED'), true);
  });

  await t.test('canTransition - invalid transitions', () => {
    assert.strictEqual(BookingStatusService.canTransition('SCHEDULED', 'COMPLETED'), false);
    assert.strictEqual(BookingStatusService.canTransition('PET_ARRIVED', 'SCHEDULED'), false);
    assert.strictEqual(BookingStatusService.canTransition('IN_PROGRESS', 'PET_ARRIVED'), false);
  });

  await t.test('canTransition - same status is blocked', () => {
    assert.strictEqual(BookingStatusService.canTransition('SCHEDULED', 'SCHEDULED'), false);
  });

  await t.test('canTransition - alternative transitions (cancellations)', () => {
    assert.strictEqual(BookingStatusService.canTransition('SCHEDULED', 'CANCELLED'), true);
    assert.strictEqual(BookingStatusService.canTransition('SCHEDULED', 'NO_SHOW'), true);
    assert.strictEqual(BookingStatusService.canTransition('PET_ARRIVED', 'CANCELLED'), true);
    assert.strictEqual(BookingStatusService.canTransition('IN_PROGRESS', 'CANCELLED'), true);
    assert.strictEqual(BookingStatusService.canTransition('READY_FOR_PICKUP', 'CANCELLED'), true);
  });

  await t.test('canTransition - terminal states block non-admin', () => {
    assert.strictEqual(BookingStatusService.canTransition('COMPLETED', 'SCHEDULED'), false);
    assert.strictEqual(BookingStatusService.canTransition('CANCELLED', 'SCHEDULED'), false);
    assert.strictEqual(BookingStatusService.canTransition('NO_SHOW', 'IN_PROGRESS'), false);
  });

  await t.test('canTransition - admin overrides terminal states', () => {
    assert.strictEqual(BookingStatusService.canTransition('COMPLETED', 'SCHEDULED', true), true);
    assert.strictEqual(BookingStatusService.canTransition('CANCELLED', 'IN_PROGRESS', true), true);
  });
});
