import z from "zod";

const PaymentMethodEnum = z.enum({
  Unknown: 0,
  Cash: 1,
  Card: 2,
  BankTransfer: 3,
  OTACollect: 4,
  OTAPrepaid: 5,
  OnAccount: 6,
});

const PaymentStatusEnum = z.enum({
  Unpaid: 0,
  DepositOnly: 1,
  PartiallyPaid: 2,
  Paid: 3,
  Overpaid: 4,
  Refunded: 5,
  Chargeback: 6,
  Voided: 7,
});

const usePaymentSchema = () => {
  return {
    PaymentMethodEnum,
    PaymentStatusEnum,
  };
};
export default usePaymentSchema;
