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

const usePaymentSchema = () => {
  return {
    PaymentMethodEnum,
  };
};
export default usePaymentSchema;
